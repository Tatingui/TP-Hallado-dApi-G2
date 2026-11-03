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

const recentSearches = loadModule(
  path.join(__dirname, '..', 'src', 'storage', 'recentSearchesStorage.js'),
  { '../database/localStore': localStoreMock }
);

test('guarda y deduplica búsquedas recientes ignorando espacios y mayúsculas', async () => {
  mockStore = {};
  await recentSearches.saveRecentSearch({ type: 'LOST', query: ' Llaves ', barrio: 'Palermo' });
  const searches = await recentSearches.saveRecentSearch({ type: 'LOST', query: 'llaves', barrio: 'Palermo' });

  assert.equal(searches.length, 1);
  assert.equal(searches[0].query, 'llaves');
  assert.equal(searches[0].barrio, 'Palermo');
});

test('vacía las búsquedas recientes correctamente', async () => {
  mockStore = {};
  await recentSearches.saveRecentSearch({ type: 'FOUND', query: 'Perro' });
  const cleared = await recentSearches.clearRecentSearches();
  assert.equal(cleared.length, 0);
  const current = await recentSearches.getRecentSearches();
  assert.equal(current.length, 0);
});
