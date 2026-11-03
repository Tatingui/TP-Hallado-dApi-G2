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

const profileBadge = loadModule(
  path.join(__dirname, '..', 'src', 'storage', 'profileTabBadge.js')
);

test('maneja contadores e incrementos/decrementos seguros sin ir por debajo de cero', () => {
  profileBadge.setProfileTabBadge(false);
  assert.equal(profileBadge.getProfileTabBadge(), false);
  assert.equal(profileBadge.getProfileTabBadgeCount(), 0);

  profileBadge.incrementProfileTabBadge();
  assert.equal(profileBadge.getProfileTabBadge(), true);
  assert.equal(profileBadge.getProfileTabBadgeCount(), 1);

  profileBadge.decrementProfileTabBadge(5);
  assert.equal(profileBadge.getProfileTabBadge(), false);
  assert.equal(profileBadge.getProfileTabBadgeCount(), 0);
});

test('notifica a los suscriptores al cambiar el estado del badge', () => {
  let notifiedState = null;
  const unsubscribe = profileBadge.subscribeToProfileTabBadge((active) => {
    notifiedState = active;
  });

  profileBadge.setProfileTabBadge(true);
  assert.equal(notifiedState, true);

  unsubscribe();
  profileBadge.setProfileTabBadge(false);
  assert.equal(notifiedState, true); // No cambia al estar desuscripto
});
