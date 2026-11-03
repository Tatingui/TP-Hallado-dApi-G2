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
  vm.runInNewContext(code, {
    exports: module.exports,
    module,
    require: (request) => dependencies[request],
  }, { filename });
  return module.exports;
}

const constants = loadModule(
  path.join(__dirname, '..', 'src', 'constants', 'publicationConstants.js'),
);
const validation = loadModule(
  path.join(__dirname, '..', 'src', 'utils', 'validation', 'publicationValidation.js'),
  { '../../constants/publicationConstants': constants },
);

test('valida título y descripción respetando los mínimos actuales', () => {
  const errors = validation.validatePublicationDetails({
    title: 'abc',
    description: 'corta',
    type: constants.PublicationType.LOST,
  });

  assert.equal(errors.title, 'Mínimo 5 caracteres.');
  assert.equal(errors.description, 'Mínimo 10 caracteres.');
});

test('exige verificación solamente para publicaciones FOUND', () => {
  const errors = validation.validatePublicationDetails({
    title: 'Objeto válido',
    description: 'Descripción suficientemente larga',
    type: constants.PublicationType.FOUND,
    verificationQuestion: ' ',
    verificationAnswer: '',
  });

  assert.equal(errors.verificationQuestion, 'La pregunta de verificación es obligatoria.');
  assert.equal(errors.verificationAnswer, 'La respuesta es obligatoria.');
});

test('valida barrio y permite una publicación LOST completa', () => {
  const complete = {
    title: 'Objeto válido',
    description: 'Descripción suficientemente larga',
    type: constants.PublicationType.LOST,
    barrio: 'Palermo',
  };

  assert.equal(Object.keys(validation.validatePublication(complete)).length, 0);
  assert.equal(validation.validatePublication({ ...complete, barrio: '' }).barrio, 'Seleccioná un barrio.');
});

test('valida límites máximos de título y descripción y maneja formulación nula', () => {
  const nullErrors = validation.validatePublication(null);
  assert.equal(nullErrors.title, 'El título es obligatorio.');
  assert.equal(validation.hasValidationErrors(nullErrors), true);

  const longTitle = 'a'.repeat(101);
  const longDesc = 'b'.repeat(1001);
  const errors = validation.validatePublicationDetails({
    title: longTitle,
    description: longDesc,
    type: constants.PublicationType.LOST,
  });
  assert.equal(errors.title, 'Máximo 100 caracteres.');
  assert.equal(errors.description, 'Máximo 1000 caracteres.');
});
