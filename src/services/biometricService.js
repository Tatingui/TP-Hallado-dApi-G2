import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BIOMETRIC_KEY = "hallado_biometric_enabled";

/**
 * Verifica si el dispositivo tiene hardware biometrico disponible.
 */
export async function hasBiometricHardware() {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return false;

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return isEnrolled;
  } catch {
    return false;
  }
}

/**
 * Obtiene los tipos de biometria disponibles (huella, face, iris).
 */
export async function getBiometricType() {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return "Face ID";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return "Huella digital";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return "Iris";
    }
  } catch {
    // ignore
  }
  return "Biometria";
}

/**
 * Realiza la autenticacion biometrica.
 * Retorna { success: true } o { success: false, error: string }.
 */
export async function authenticate() {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Desbloquea Hallado",
      cancelLabel: "Cancelar",
      disableDeviceFallback: false,
      fallbackLabel: "Usar PIN",
    });

    return {
      success: result.success,
      error: result.success ? null : "Autenticacion cancelada o fallida",
    };
  } catch (err) {
    return { success: false, error: "Error al autenticar" };
  }
}

/**
 * Guarda la preferencia de bloqueo biometrico.
 */
export async function setBiometricEnabled(enabled) {
  await AsyncStorage.setItem(BIOMETRIC_KEY, JSON.stringify(enabled));
}

/**
 * Lee si el bloqueo biometrico esta activado.
 */
export async function isBiometricEnabled() {
  try {
    const value = await AsyncStorage.getItem(BIOMETRIC_KEY);
    return value ? JSON.parse(value) : false;
  } catch {
    return false;
  }
}

/**
 * Limpia la preferencia de bloqueo biometrico (para logout).
 */
export async function clearBiometricEnabled() {
  try {
    await AsyncStorage.removeItem(BIOMETRIC_KEY);
  } catch {
    // ignore
  }
}
