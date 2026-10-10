import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";
const USER_EMAIL_KEY = "user_email";

/**
 * Guarda el token JWT y el email del usuario.
 * Equivalente a SharedPreferences en Android.
 */
export async function saveSession(token, email) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  if (email) {
    await AsyncStorage.setItem(USER_EMAIL_KEY, email);
  }
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getUserEmail() {
  return AsyncStorage.getItem(USER_EMAIL_KEY);
}

export async function clearSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_EMAIL_KEY]);
}

/**
 * Devuelve true si hay un token guardado.
 */
export async function isLoggedIn() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return token !== null;
}
