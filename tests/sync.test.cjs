const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
async function engine(overrides = {}) {
  const source = fs.readFileSync('src/sync/syncEngine.js', 'utf8');
  const { createSyncEngine } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const completed = [], failures = [];
  const session = { owner: 'a' };
  const sync = createSyncEngine({ getSession: () => session, isCurrent: () => true, isOnline: async () => true,
    list: async () => [{ id: 'one', operationType: 'CREATE_PUBLICATION', retryCount: 0, state: 'pending', nextAttemptAt: 0 }],
    send: async () => ({ id: 1 }), complete: async op => completed.push(op.id),
    fail: async (op, error) => failures.push(error), now: () => 1000, ...overrides });
  return { sync, completed, failures };
}
test('simultaneous triggers share one run, including connectivity checks', async () => {
  let sends = 0;
  const { sync, completed } = await engine({ send: async () => { sends++; return { id: 1 }; } });
  await Promise.all([sync(), sync(), sync()]);
  assert.equal(sends, 1); assert.deepEqual(completed, ['one']);
});
test('lost response retries without deleting; permanent validation blocks', async () => {
  for (const [status, state] of [[0, 'pending'], [500, 'pending'], [429, 'pending'], [400, 'blocked'], [403, 'blocked']]) {
    const { sync, completed, failures } = await engine({ send: async () => { throw { status }; } });
    await sync(); assert.deepEqual(completed, []); assert.equal(failures[0].state, state);
    assert.equal(failures[0].nextAttemptAt, 3000);
  }
});
test('switching accounts during a request does not acknowledge or continue old operations', async () => {
  let current = true;
  const { sync, completed, failures } = await engine({ isCurrent: () => current, send: async () => { current = false; return { id: 1 }; } });
  await sync(); assert.deepEqual(completed, []); assert.deepEqual(failures, []);
});
test('claims are blocked rather than sent from the offline queue', async () => {
  let sent = false;
  const { sync, failures } = await engine({ list: async () => [{ operationType: 'CREATE_CLAIM' }], send: async () => { sent = true; } });
  await sync(); assert.equal(sent, false); assert.equal(failures[0].state, 'blocked');
});
