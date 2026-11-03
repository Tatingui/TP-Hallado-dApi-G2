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

const passwordValidation = loadModule(
  path.join(__dirname, '..', 'src', 'utils', 'validation', 'passwordValidation.js')
);

test('valida criterios de contraseña correctamente', () => {
  const invalid = passwordValidation.validatePasswordCriteria('abc');
  assert.equal(invalid.valid, false);
  assert.equal(invalid.errors.length > 0, true);

  const valid = passwordValidation.validatePasswordCriteria('Valida123!');
  assert.equal(valid.valid, true);
  assert.equal(valid.errors.length, 0);
});

test('valida coincidencia de contraseñas y mensajes de error', () => {
  assert.equal(
    passwordValidation.validatePasswordMatch('', 'Valida123!'),
    'Completá la contraseña y su confirmación'
  );
  assert.equal(
    passwordValidation.validatePasswordMatch('Valida123!', 'Otra123!'),
    'Las contraseñas no coinciden'
  );
  assert.equal(
    passwordValidation.validatePasswordMatch('Valida123!', 'Valida123!'),
    null
  );
});
