import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';

// Referencia al NavigationContainer para navegar desde fuera de las pantallas
// (por ejemplo, api.js cuando vence el token o AuthContext al cerrar sesión).
export const navigationRef = createNavigationContainerRef();

// Deja una única pantalla en la pila, así el botón atrás no vuelve a la anterior.
export function resetTo(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name, params }] })
    );
  }
}
