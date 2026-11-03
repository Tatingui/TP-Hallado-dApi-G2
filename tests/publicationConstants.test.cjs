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

const publicationConstants = loadModule(
  path.join(__dirname, '..', 'src', 'constants', 'publicationConstants.js')
);

test('valida tipos y estados de publicación correctamente', () => {
  assert.equal(publicationConstants.isValidPublicationType('LOST'), true);
  assert.equal(publicationConstants.isValidPublicationType('FOUND'), true);
  assert.equal(publicationConstants.isValidPublicationType('INVALID'), false);

  assert.equal(publicationConstants.isValidPublicationStatus('OPEN'), true);
  assert.equal(publicationConstants.isValidPublicationStatus('PENDIENTE_ENVIO'), true);
  assert.equal(publicationConstants.isValidPublicationStatus('UNKNOWN'), false);
});

test('retorna etiquetas y colores de estado por defecto', () => {
  assert.equal(publicationConstants.getTypeLabel('LOST'), 'Objeto / Mascota Perdida');
  assert.equal(publicationConstants.getStatusLabel('RESOLVED'), 'Resuelta');
  assert.equal(publicationConstants.getCategoryLabel('KEYS'), 'Llaves');
  assert.equal(publicationConstants.getClaimStatusLabel('ACCEPTED'), 'Aceptado');
});
