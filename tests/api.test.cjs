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

/**
 * Carga api.js y publicationService.js con dependencias simuladas y reemplaza
 * XMLHttpRequest y FormData para inspeccionar lo que se envía.
 */
async function withPublicationTransport(run, { storedToken = 'different-token' } = {}) {
  const state = { expired: 0, requests: [] };
  const session = { owner: 'a', token: 'captured-token' };
  const auth = { getToken: async () => storedToken, clearSession: async () => { state.expired++; } };
  const api = load('src/services/api.js', {
    '../storage/authStorage': auth, '../navigation/navigationRef': { resetTo() {} },
    '../constants/apiConfig': { API_URL: 'http://backend/api' },
    '../database/session': { getDatabaseSession: () => session, assertCurrentSession() {}, isCurrentSession: () => true },
    '../database/localStore': { readLocal: async () => null, writeLocal: async () => {} },
    '../database': { database: { write: async action => action(), get: () => ({ query: () => ({ fetch: async () => [] }) }), batch: async () => {} } },
    '@nozbe/watermelondb': { Q: { where() {}, like() {}, sanitizeLikeString: value => value } },
  });
  const publications = load('src/services/publicationService.js', { '../storage/authStorage': auth, './api': api });

  const previous = { XMLHttpRequest: global.XMLHttpRequest, FormData: global.FormData, fetch: global.fetch };
  global.FormData = class {
    constructor() { this.parts = []; }
    append(name, value) { this.parts.push([name, value]); }
  };
  global.XMLHttpRequest = class {
    constructor() { this.headers = {}; state.requests.push(this); }
    open(method, url) { this.url = url; }
    setRequestHeader(key, value) { this.headers[key] = value; }
    send(body) { this.body = body; this.status = 201; this.responseText = '{"id":42}'; queueMicrotask(() => this.onload()); }
  };
  try {
    await run({ api, publications, session, state });
  } finally {
    global.XMLHttpRequest = previous.XMLHttpRequest;
    global.FormData = previous.FormData;
    global.fetch = previous.fetch;
  }
}

test('publication transport carries the stable idempotency key and captured account token', async () => {
  await withPublicationTransport(async ({ api, publications, session, state }) => {
    const result = await publications.createPublicationApi({ title: 'Llaves' }, [], session.token, 'same-operation');
    assert.equal(result.id, 42);
    assert.equal(state.requests[0].headers['X-Idempotency-Key'], 'same-operation');
    assert.equal(state.requests[0].headers.Authorization, 'Bearer captured-token');
    global.fetch = async () => ({ ok: false, status: 403, headers: { get: () => 'application/json' }, json: async () => ({ message: 'Sin permiso' }) });
    await assert.rejects(api.apiPost('/claims', {}, session.token), error => error.status === 403);
    assert.equal(state.expired, 0);
  });
});

test('una publicación sin fotos envía igual un multipart con los datos (nunca vacío)', async () => {
  await withPublicationTransport(async ({ publications, session, state }) => {
    const publication = { title: 'Llaves', eventDate: '2026-11-02T21:30:00' };
    await publications.createPublicationApi(publication, [], session.token, 'sin-fotos');

    const request = state.requests[0];
    assert.equal(request.url, 'http://backend/api/publications', 'los datos ya no viajan en la URL');
    assert.deepEqual(request.body.parts, [['publication', JSON.stringify(publication)]]);
  });
});

test('un pendiente guardado sin lista de fotos también se puede enviar', async () => {
  await withPublicationTransport(async ({ publications, session, state }) => {
    await publications.createPublicationApi({ title: 'Llaves' }, null, session.token, 'pendiente-viejo');
    assert.equal(state.requests[0].body.parts.length, 1);
  });
});

test('las fotos viajan junto a los datos de la publicación', async () => {
  await withPublicationTransport(async ({ publications, session, state }) => {
    const fotos = [{ uri: 'file:///a.jpg', fileName: 'a.jpg' }, { uri: 'file:///b.png', type: 'image/png' }];
    await publications.createPublicationApi({ title: 'Llaves' }, fotos, session.token, 'con-fotos');

    const parts = state.requests[0].body.parts;
    assert.deepEqual(parts.map(([name]) => name), ['publication', 'images', 'images']);
    assert.deepEqual(parts[1][1], { uri: 'file:///a.jpg', type: 'image/jpeg', name: 'a.jpg' });
    assert.deepEqual(parts[2][1], { uri: 'file:///b.png', type: 'image/png', name: 'image_1.jpg' });
  });
});

test('las peticiones autenticadas usan el token guardado y respetan uno explícito', async () => {
  await withPublicationTransport(async ({ api, session }) => {
    const headers = [];
    global.fetch = async (url, options) => {
      headers.push(options.headers.Authorization);
      return { ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => ({}) };
    };

    await api.authGet('/usuarios/me');
    await api.authPost('/alerts', {}, session.token);
    await api.apiPost('/auth/login', {});

    assert.deepEqual(headers, ['Bearer captured-token', 'Bearer captured-token', undefined]);
  }, { storedToken: 'captured-token' });
});

