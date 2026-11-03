// Las fechas se prueban con la zona horaria de Argentina, donde aparecía el corrimiento de 3 horas.
process.env.TZ = 'America/Argentina/Buenos_Aires';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');

function loadDateUtils() {
  const filename = path.join(__dirname, '..', 'src', 'utils', 'date.js');
  const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });
  const exports = {};
  vm.runInNewContext(code, { exports, Date, Number, String }, { filename });
  return exports;
}

const date = loadDateUtils();

test('se envía la hora local, sin la Z de UTC', () => {
  const nocheLocal = new Date(2026, 10, 2, 21, 30, 5);
  assert.equal(date.toLocalDateTimeString(nocheLocal), '2026-11-02T21:30:05');
});

test('lo enviado y lo leído del backend representan la misma hora (sin corrimiento de 3 horas)', () => {
  const elegida = new Date(2026, 10, 2, 21, 30, 0);
  const guardada = date.toLocalDateTimeString(elegida);
  assert.equal(date.formatDateTime(guardada), '02/11/2026 21:30');
});

test('el día local no cambia de noche, aunque en UTC ya sea el día siguiente', () => {
  const nocheLocal = new Date(2026, 10, 2, 22, 30);
  assert.equal(date.toLocalDateString(nocheLocal), '2026-11-02');
});

test('los formatos de fecha y hora', () => {
  assert.equal(date.formatDate('2026-01-05T08:07:00'), '05/01/2026');
  assert.equal(date.formatTime('2026-01-05T08:07:00'), '08:07');
});

test('un valor vacío o inválido muestra el texto alternativo', () => {
  assert.equal(date.formatDate(null), '-');
  assert.equal(date.formatDateTime('no es fecha', 'Sin fecha'), 'Sin fecha');
});
