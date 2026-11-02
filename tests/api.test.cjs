const { test } = require('node:test');
const assert = require('node:assert/strict');
const babel = require('@babel/core');

function load(file, mocks) {
  const { code } = babel.transformFileSync(file, { configFile: false, babelrc: false, plugins: ['@babel/plugin-transform-modules-commonjs'] });
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(id => {
    if (!(id in mocks)) throw new Error('Unexpected dependency: ' + id);
    return mocks[id];
  }, module, module.exports);
  return module.exports;
}

test('publication transport carries the stable idempotency key and captured account token', async () => {
  let expired = 0;
  const requests = [];
  const session = { owner: 'a', token: 'captured-token' };
  const auth = { getToken: async () => 'different-token', clearSession: async () => { expired++; } };
  const api = load('src/services/api.js', {
    '../storage/authStorage': auth, '../navigation/navigationRef': { resetTo() {} },
    '../constants/apiConfig': { API_URL: 'http://backend/api' },
    '../database/session': { getDatabaseSession: () => session, assertCurrentSession() {}, isCurrentSession: () => true },
    '../database/localStore': { readLocal: async () => null, writeLocal: async () => {} },
    '../database': { database: { write: async action => action(), get: () => ({ query: () => ({ fetch: async () => [] }) }), batch: async () => {} } },
    '@nozbe/watermelondb': { Q: { where() {}, like() {}, sanitizeLikeString: value => value } },
  });
  const publications = load('src/services/publicationService.js', { '../storage/authStorage': auth, './api': api });
  const previousXHR = global.XMLHttpRequest;
  const previousFormData = global.FormData;
  const previousFetch = global.fetch;
  global.FormData = class { append() {} };
  global.XMLHttpRequest = class {
    constructor() { this.headers = {}; requests.push(this); }
    open(method, url) { this.url = url; }
    setRequestHeader(key, value) { this.headers[key] = value; }
    send() { this.status = 201; this.responseText = '{"id":42}'; queueMicrotask(() => this.onload()); }
  };
  try {
    const result = await publications.createPublicationApi({ title: 'Llaves' }, [], session.token, 'same-operation');
    assert.equal(result.id, 42);
    assert.equal(requests[0].headers['X-Idempotency-Key'], 'same-operation');
    assert.equal(requests[0].headers.Authorization, 'Bearer captured-token');
    global.fetch = async () => ({ ok: false, status: 403, headers: { get: () => 'application/json' }, json: async () => ({ message: 'Sin permiso' }) });
    await assert.rejects(api.apiPost('/claims', {}, session.token), error => error.status === 403);
    assert.equal(expired, 0);
  } finally {
    global.XMLHttpRequest = previousXHR;
    global.FormData = previousFormData;
    global.fetch = previousFetch;
  }
});
