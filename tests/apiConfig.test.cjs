const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');

function loadModule(filename) {
  const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });
  const module = { exports: {} };
  vm.runInNewContext(code, { exports: module.exports, module, process: { env: {} } }, { filename });
  return module.exports;
}

const apiConfig = loadModule(
  path.join(__dirname, '..', 'src', 'constants', 'apiConfig.js')
);

test('sanitiza la URL base de la API eliminando barras finales y espacios', () => {
  assert.equal(apiConfig.sanitizeApiUrl('http://localhost:8080/api/'), 'http://localhost:8080/api');
  assert.equal(apiConfig.sanitizeApiUrl('  http://localhost:8080/api///  '), 'http://localhost:8080/api');
  assert.equal(apiConfig.sanitizeApiUrl(null), 'http://10.0.2.2:8081/api');
});
