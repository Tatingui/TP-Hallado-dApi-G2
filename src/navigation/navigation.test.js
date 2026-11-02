const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');

// Usar los parsers y routers reales; sustituir únicamente los módulos nativos de Expo.
async function loadLinking() {
  const core = await import('@react-navigation/core');
  const routers = await import('@react-navigation/routers');
  const filename = path.join(__dirname, 'linking.js');
  const { code } = babel.transformSync(fs.readFileSync(filename, 'utf8'), {
    babelrc: false,
    configFile: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require(name) {
      if (name === 'expo-linking') return { createURL: () => 'exp://localhost:8081/--/' };
      if (name === '@react-navigation/native') return { ...core, ...routers };
      throw new Error(`Unexpected import: ${name}`);
    },
  }, { filename });
  return exports;
}

test('links preserve their destination behind session restoration and provide a back route', async () => {
  const { getLinkedState, getLinkedPath } = await loadLinking();
  for (const [url, name, id] of [
    ['/publication/42', 'PublicationDetail', '42'],
    ['/publication/edit/42', 'EditPublication', '42'],
    ['/profile/public/17', 'PublicProfile', '17'],
    ['/profile/alert/9', 'AlertResults', '9'],
  ]) {
    const state = getLinkedState(url);
    assert.equal(state.routes[0].name, 'Start');
    const destination = state.routes[0].params.nextState;
    assert.equal(destination.routes[0].name, 'Main');
    assert.equal(destination.routes[1].name, name);
    assert.equal(destination.routes[1].params.id, id);
    assert.equal(getLinkedPath(state), url);
    assert.equal(getLinkedPath(destination), url);
  }
});

test('claims links retain received tab and unknown links are ignored', async () => {
  const { getLinkedState } = await loadLinking();
  const state = getLinkedState('/claims?tab=received').routes[0].params.nextState;
  assert.equal(state.routes.length, 1);
  const tabs = state.routes[0].state;
  assert.equal(tabs.routes[tabs.index].name, 'ClaimsTab');
  assert.equal(tabs.routes[tabs.index].params.tab, 'received');
  assert.equal(getLinkedState('/does-not-exist'), undefined);
});

test('auth links cannot inject internal navigation state', async () => {
  const { getLinkedState, getLinkedPath } = await loadLinking();
  const state = getLinkedState('/login?nextState=invalid');
  assert.equal(state.routes[0].name, 'Login');
  assert.equal(state.routes[0].params?.nextState, undefined);
  assert.equal(getLinkedPath(state), '/login');
});

test('warm links reset through the session gate', async () => {
  const { linking } = await loadLinking();
  const state = linking.getStateFromPath('/publication/42');
  const action = linking.getActionFromState(state);
  assert.equal(action.type, 'RESET');
  assert.equal(action.payload.routes[0].name, 'Start');
});

test('returning to claims preserves the existing Main instead of duplicating it', async () => {
  const { StackRouter, StackActions, CommonActions } = await import('@react-navigation/routers');
  const router = StackRouter({ initialRouteName: 'Main' });
  const options = { routeNames: ['Main', 'PublicationDetail'], routeParamList: {}, routeGetIdList: {} };
  let state = router.getInitialState(options);
  const mainKey = state.routes[0].key;
  state = router.getStateForAction(state, CommonActions.navigate('PublicationDetail', { id: '42' }), options);
  state = router.getStateForAction(state, StackActions.popTo('Main', { screen: 'ClaimsTab', params: { tab: 'received' } }), options);
  assert.equal(state.routes.length, 1);
  assert.equal(state.routes[0].key, mainKey);
  assert.equal(state.routes[0].params.params.tab, 'received');
});
