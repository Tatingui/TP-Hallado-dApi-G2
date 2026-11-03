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
  vm.runInNewContext(code, { exports: module.exports, module }, { filename });
  return module.exports;
}

const statusConstants = loadModule(
  path.join(__dirname, '..', 'src', 'constants', 'statusConstants.js')
);

test('obtiene metadatos y colores para estados de publicaciones', () => {
  const openMeta = statusConstants.getPublicationStatusMetadata('OPEN');
  assert.equal(openMeta.label, 'Abierta');
  assert.equal(openMeta.color, '#1A56DB');

  const unknownMeta = statusConstants.getPublicationStatusMetadata('DESCONOCIDO');
  assert.equal(unknownMeta.label, 'DESCONOCIDO');
});

test('obtiene metadatos y colores para estados de reclamos', () => {
  const acceptedMeta = statusConstants.getClaimStatusMetadata('ACCEPTED');
  assert.equal(acceptedMeta.label, 'Aceptado');
  assert.equal(acceptedMeta.color, '#16A34A');
});
