import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";
const USER_EMAIL_KEY = "user_email";

/**
 * Guarda el token JWT en SecureStore (cifrado) y el email en AsyncStorage.
 * SecureStore tiene un limite de 2KB por clave — un JWT entra sin problemas.
 */
export async function saveSession(token, email) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  if (email) {
    await AsyncStorage.setItem(USER_EMAIL_KEY, email);
  }
}

/**
 * Obtiene el token JWT desde SecureStore.
 */
export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Obtiene el email del usuario desde AsyncStorage.
 */
export async function getUserEmail() {
  return AsyncStorage.getItem(USER_EMAIL_KEY);
}

/**
 * Limpia la sesion: borra token de SecureStore y email de AsyncStorage.
 */
export async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_EMAIL_KEY);
}

/**
 * Devuelve true si hay un token guardado en SecureStore.
 */
export async function isLoggedIn() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return token !== null;
}
