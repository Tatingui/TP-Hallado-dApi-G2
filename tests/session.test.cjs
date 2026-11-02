const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('account switches and logout invalidate captured sessions', async () => {
  const source = fs.readFileSync('src/database/session.js', 'utf8');
  const session = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  session.setDatabaseSession('Alice@Example.com', 'token-a');
  const alice = session.getDatabaseSession();
  assert.equal(alice.owner, 'alice@example.com');
  session.setDatabaseSession('bob@example.com', 'token-b');
  assert.equal(session.isCurrentSession(alice), false);
  assert.throws(() => session.assertCurrentSession(alice), { code: 'SESSION_CHANGED' });
  const bob = session.getDatabaseSession();
  session.setDatabaseSession(null, null);
  assert.equal(session.isCurrentSession(bob), false);
  assert.throws(() => session.getDatabaseSession());
});
