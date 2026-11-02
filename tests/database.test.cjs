const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const babel = require('@babel/core');
process.env.NODE_ENV = 'test';
const root = path.resolve('src') + path.sep;
const originalJs = require.extensions['.js'];
require.extensions['.js'] = (mod, filename) => {
  if (!filename.startsWith(root)) return originalJs(mod, filename);
  const { code } = babel.transformFileSync(filename, { configFile: false, babelrc: false,
    plugins: [['@babel/plugin-proposal-decorators', { legacy: true }], '@babel/plugin-transform-class-properties', '@babel/plugin-transform-modules-commonjs'] });
  mod._compile(code, filename);
};
const { Database } = require('@nozbe/watermelondb');
const LokiAdapter = require('@nozbe/watermelondb/adapters/lokijs').default;
const schema = require('../src/database/schema').default;
const migrations = require('../src/database/migrations').default;
const modelClasses = fs.readdirSync('src/database/models').map(file => require('../src/database/models/' + file).default);
const database = new Database({ adapter: new LokiAdapter({ schema, migrations, useWebWorker: false, useIncrementalIndexedDB: false, dbName: 'review-tests' }), modelClasses });
const legacy = new Map();
let confirmRecovery = true;
const originalLoad = Module._load;
Module._load = function(request, parent, main) {
  if (request === 'expo-crypto') return { randomUUID: require('node:crypto').randomUUID };
  if (request === 'react-native') return { Alert: { alert: (_, __, buttons) => buttons[confirmRecovery ? 1 : 0].onPress() } };
  if (request === '@react-native-async-storage/async-storage') return { multiGet: async keys => keys.map(key => [key, legacy.get(key) || null]) };
  if (request === 'expo-file-system/legacy') return {
    documentDirectory: 'file:///app/', makeDirectoryAsync: async () => {},
    getInfoAsync: async uri => ({ exists: !uri.includes('missing') }), copyAsync: async () => {},
    downloadAsync: async () => ({ status: 200 }), deleteAsync: async () => {},
  };
  if (parent?.filename.startsWith(root) && path.resolve(path.dirname(parent.filename), request).replace(/\.js$/, '') === path.resolve('src/database/index')) return { database };
  if (parent?.filename.startsWith(root) && path.resolve(path.dirname(parent.filename), request) === path.resolve('src/database')) return { database };
  return originalLoad.apply(this, arguments);
};
const sessions = require('../src/database/session');
const publications = require('../src/repositories/publicationRepository');
const pending = require('../src/repositories/pendingRepository');
const local = require('../src/database/localStore');

test.after(() => database.adapter.underlyingAdapter._driver.loki.close());

test('WatermelonDB domain operations (Loki test adapter): account isolation, upsert, durable queue and migration replay', async () => {
  sessions.setDatabaseSession('a@example.com', 'a');
  await publications.savePublicationsToLocal([{ id: 7, title: 'Llaves', status: 'OPEN' }]);
  await publications.savePublicationsToLocal([{ id: 7, title: 'Llaves', status: 'RESOLVED' }]);
  assert.equal((await publications.getLocalPublications()).length, 1);
  assert.equal((await publications.getLocalPublications())[0].status, 'RESOLVED');
  await pending.enqueuePublication({ title: 'Mochila' }, [], { idempotencyKey: 'stable' });
  await pending.enqueuePublication({ title: 'Mochila' }, [], { idempotencyKey: 'stable' });
  assert.equal((await pending.getPendingOperations()).length, 1);
  sessions.setDatabaseSession('b@example.com', 'b');
  assert.deepEqual(await publications.getLocalPublications(), []);
  assert.deepEqual(await pending.getPendingOperations(), []);
  sessions.setDatabaseSession('a@example.com', 'a');
  const operation = (await pending.getPendingOperations())[0];
  await pending.completeOperation(operation, { id: 8, title: 'Mochila', status: 'OPEN' }, sessions.getDatabaseSession());
  assert.equal((await pending.getPendingOperations()).length, 0);
  assert.equal((await publications.getLocalPublications()).length, 2);

  legacy.set('hallado_publication_draft', JSON.stringify({ title: 'Borrador', images: [], currentStep: 3 }));
  legacy.set('@hallado_pending_publications_queue_v1', JSON.stringify([{ offlineId: 'old-1', payload: { title: 'Pendiente' }, images: [{ uri: 'file:///missing.jpg' }] }]));
  const { migrateAsyncStorageToWatermelon } = require('../src/database/dataMigration');
  confirmRecovery = false;
  await migrateAsyncStorageToWatermelon();
  assert.equal((await pending.getPendingOperations()).length, 0);
  confirmRecovery = true;
  await migrateAsyncStorageToWatermelon();
  await migrateAsyncStorageToWatermelon();
  assert.equal((await pending.getPendingOperations()).length, 1);
  assert.equal((await pending.getPendingOperations())[0].state, 'blocked');
  assert.equal((await local.readLocal('draft')).currentStep, 3);
  assert.ok(legacy.has('hallado_publication_draft'));
  sessions.setDatabaseSession('b@example.com', 'b');
  await migrateAsyncStorageToWatermelon();
  assert.equal(await local.readLocal('draft'), null);
});
