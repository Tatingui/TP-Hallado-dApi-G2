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

let mockStore = {};
const localStoreMock = {
  readLocal: async (key, fallback) => (key in mockStore ? mockStore[key] : fallback),
  writeLocal: async (key, value) => {
    mockStore[key] = value;
    return value;
  },
};

const draftStorage = loadModule(
  path.join(__dirname, '..', 'src', 'storage', 'draftStorage.js'),
  { '../database/localStore': localStoreMock }
);

test('sanitiza borradores garantizando estructura válida', () => {
  const sanitizedNull = draftStorage.sanitizeDraft(null);
  assert.equal(sanitizedNull.title, '');
  assert.equal(sanitizedNull.images.length, 0);

  const sanitizedPartial = draftStorage.sanitizeDraft({ title: 'Objeto', images: 'invalid' });
  assert.equal(sanitizedPartial.title, 'Objeto');
  assert.equal(sanitizedPartial.images.length, 0);
});

test('guarda y carga borrador correctamente', async () => {
  mockStore = {};
  await draftStorage.saveDraft({ title: 'Llave perdida', barrio: 'Palermo' });
  const loaded = await draftStorage.loadDraft();
  assert.equal(loaded.title, 'Llave perdida');
  assert.equal(loaded.barrio, 'Palermo');
});
