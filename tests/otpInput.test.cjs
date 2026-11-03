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

// Simulador liviano de React para probar la lógica pura del hook
function createHookRunner(useOtpInputHook, length = 4) {
  let state;
  const setState = (updater) => {
    state = typeof updater === 'function' ? updater(state) : updater;
  };
  const reactMock = {
    useState: (initial) => [
      state !== undefined ? state : (typeof initial === 'function' ? initial() : initial),
      setState,
    ],
    useRef: (initial) => ({ current: initial }),
    useCallback: (fn) => fn,
  };
  state = Array(length).fill('');
  return {
    getState: () => state,
    hook: useOtpInputHook(length),
  };
}

const otpModule = loadModule(
  path.join(__dirname, '..', 'src', 'hooks', 'useOtpInput.js'),
  {
    react: {
      useCallback: (fn) => fn,
      useRef: (init) => ({ current: init }),
      useState: (init) => [typeof init === 'function' ? init() : init, () => {}],
    },
  }
);

test('hook useOtpInput exporta funciones esperadas', () => {
  assert.equal(typeof otpModule.useOtpInput, 'function');
});
