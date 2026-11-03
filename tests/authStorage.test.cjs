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

const mockSecureStore = {};
const mockAsyncStorage = {};

const authStorage = loadModule(
  path.join(__dirname, '..', 'src', 'storage', 'authStorage.js'),
  {
    '../database/session': { setDatabaseSession: () => {} },
    'expo-secure-store': {
      setItemAsync: async (k, v) => { mockSecureStore[k] = v; },
      getItemAsync: async (k) => mockSecureStore[k] || null,
      deleteItemAsync: async (k) => { delete mockSecureStore[k]; },
    },
    '@react-native-async-storage/async-storage': {
      setItem: async (k, v) => { mockAsyncStorage[k] = v; },
      getItem: async (k) => mockAsyncStorage[k] || null,
      removeItem: async (k) => { delete mockAsyncStorage[k]; },
    },
  }
);

test('valida formato de token JWT correctamente', () => {
  assert.equal(authStorage.isValidTokenFormat('header.payload.signature'), true);
  assert.equal(authStorage.isValidTokenFormat('invalid-token'), false);
  assert.equal(authStorage.isValidTokenFormat(null), false);
});

test('rechaza guardar sesiones con tokens inválidos', async () => {
  await assert.rejects(
    async () => {
      await authStorage.saveSession('token-invalido', 'user@test.com');
    },
    /formato JWT válido/
  );
});
