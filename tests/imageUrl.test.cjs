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

const imageUrlUtils = loadModule(
  path.join(__dirname, '..', 'src', 'utils', 'imageUrl.js'),
  { '../services/api': { IMAGE_BASE_URL: 'http://localhost:8080' } }
);

test('devuelve null para entradas vacías o que no sean cadenas', () => {
  assert.equal(imageUrlUtils.resolveImageUrl(null), null);
  assert.equal(imageUrlUtils.resolveImageUrl(undefined), null);
  assert.equal(imageUrlUtils.resolveImageUrl('   '), null);
  assert.equal(imageUrlUtils.resolveImageUrl(12345), null);
});

test('retorna intactas las URLs absolutas, locales y data URIs', () => {
  assert.equal(imageUrlUtils.resolveImageUrl('http://example.com/img.png'), 'http://example.com/img.png');
  assert.equal(imageUrlUtils.resolveImageUrl('https://example.com/img.png'), 'https://example.com/img.png');
  assert.equal(imageUrlUtils.resolveImageUrl('file:///local/img.png'), 'file:///local/img.png');
  assert.equal(imageUrlUtils.resolveImageUrl('data:image/png;base64,123'), 'data:image/png;base64,123');
});

test('resuelve URLs relativas agregando la URL base correctamente', () => {
  assert.equal(imageUrlUtils.resolveImageUrl('/uploads/foto.jpg'), 'http://localhost:8080/uploads/foto.jpg');
  assert.equal(imageUrlUtils.resolveImageUrl('uploads/foto.jpg'), 'http://localhost:8080/uploads/foto.jpg');
});
