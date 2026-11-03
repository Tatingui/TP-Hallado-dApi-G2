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

const countdownModule = loadModule(
  path.join(__dirname, '..', 'src', 'hooks', 'useCountdown.js'),
  {
    react: {
      useCallback: (fn) => fn,
      useEffect: () => {},
      useState: (init) => [typeof init === 'function' ? init() : init, () => {}],
    },
  }
);

test('hook useCountdown exporta funcion useCountdown', () => {
  assert.equal(typeof countdownModule.useCountdown, 'function');
});
