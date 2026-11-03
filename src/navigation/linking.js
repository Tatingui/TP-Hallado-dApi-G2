import * as Linking from 'expo-linking';
import { CommonActions, getPathFromState, getStateFromPath } from '@react-navigation/native';

const authScreens = new Set([
  'Start', 'Login', 'Register', 'RegisterCode', 'CompleteRegistration', 'VerifyOtp',
  'ForgotPassword', 'ResetPassword', 'NewPassword', 'Lock',
]);

export const linkConfig = {
  screens: {
    Start: '',
    Login: 'login',
    Register: 'register',
    RegisterCode: 'register/code',
    CompleteRegistration: 'register/complete',
    VerifyOtp: 'verify-otp',
    ForgotPassword: 'forgot-password',
    ResetPassword: 'reset-password',
    NewPassword: 'new-password',
    Main: {
      initialRouteName: 'HomeTab',
      screens: {
        HomeTab: 'home',
        PublishTab: 'publish',
        MyPublicationsTab: 'my-publications',
        ClaimsTab: 'claims',
        ProfileTab: 'profile',
      },
    },
    PublicationDetail: 'publication/:id',
    EditPublication: 'publication/edit/:id',
    PublicProfile: 'profile/public/:id',
    EditProfile: 'profile/edit',
    ResolvedHistory: 'profile/resolved-history',
    MyAlerts: 'profile/alerts',
    AlertResults: 'profile/alert/:id',
    FollowedPublications: 'profile/followed',
  },
};

export function getLinkedState(path, config = linkConfig) {
  const state = getStateFromPath(path, config);
  if (!state) return undefined;
  // nextState es interno: nunca aceptar un estado de navegación desde la query.
  function stripInternalParams(current) {
    for (const route of current.routes) {
      if (route.params) delete route.params.nextState;
      if (route.state) stripInternalParams(route.state);
    }
  }
  stripInternalParams(state);
  const route = state.routes[state.index ?? state.routes.length - 1];
  if (authScreens.has(route.name)) return state;

  // Pasar primero por la restauración de sesión y el bloqueo biométrico.
  const routes = route.name === 'Main' ? [route] : [{ name: 'Main' }, route];
  return {
    index: 0,
    routes: [{ name: 'Start', params: { nextState: { index: routes.length - 1, routes } } }],
  };
}

export function getLinkedPath(state, config = linkConfig) {
  const route = state.routes[state.index ?? state.routes.length - 1];
  return getPathFromState(route.params?.nextState ?? state, config);
}

export const linking = {
  prefixes: [Linking.createURL('/'), 'tpreactnative://'],
  config: linkConfig,
  getStateFromPath: getLinkedState,
  getPathFromState: getLinkedPath,
  // También los enlaces recibidos con la app abierta atraviesan Start.
  getActionFromState: (state) => CommonActions.reset(state),
};
