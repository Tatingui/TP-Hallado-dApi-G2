const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');

function loadModule(filename, dependencies = {}) {
  const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });
  const module = { exports: {} };
  vm.runInNewContext(
    code,
    {
      exports: module.exports,
      module,
      require: (request) => dependencies[request] || {},
    },
    { filename }
  );
  return module.exports;
}

const mockOperations = [
  { id: '1', state: 'PENDING', payloadJson: JSON.stringify({ publication: { title: 'T1' } }) },
  { id: '2', state: 'FAILED', payloadJson: JSON.stringify({ publication: { title: 'T2' } }) },
  { id: '3', state: 'PENDING', payloadJson: JSON.stringify({ publication: { title: 'T3' } }) },
];

const pendingRepositoryMock = {
  getPendingOperations: async () => mockOperations,
  enqueuePublication: async () => {},
  removePending: async () => {},
};

const pendingStorage = loadModule(
  path.join(__dirname, '..', 'src', 'storage', 'pendingSyncStorage.js'),
  { '../repositories/pendingRepository': pendingRepositoryMock }
);

test('filtra operaciones pendientes por estado correctamente', async () => {
  const failed = await pendingStorage.getPendingByStatus('FAILED');
  assert.equal(failed.length, 1);
  assert.equal(failed[0].offlineId, '2');
});

test('calcula resumen de la cola offline adecuadamente', async () => {
  const summary = await pendingStorage.getPendingSummary();
  assert.equal(summary.total, 3);
  assert.equal(summary.pending, 2);
  assert.equal(summary.failed, 1);
});
