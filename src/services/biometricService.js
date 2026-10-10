import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BIOMETRIC_KEY = "hallado_biometric_enabled";

/**
 * Verifica si el dispositivo tiene hardware biométrico disponible.
 */
export async function hasBiometricHardware() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return isEnrolled;
}

/**
 * Obtiene los tipos de biometría disponibles (huella, face, iris).
 */
export async function getBiometricType() {
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
  return "Biometría";
}

/**
 * Realiza la autenticación biométrica.
 * Retorna { success: true } o { success: false, error: string }.
 */
export async function authenticate() {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Desbloqueá Hallado",
      cancelLabel: "Cancelar",
      disableDeviceFallback: false,
      fallbackLabel: "Usar PIN",
    });

    return {
      success: result.success,
      error: result.success ? null : "Autenticación cancelada o fallida",
    };
  } catch (err) {
    return { success: false, error: "Error al autenticar" };
  }
}

/**
 * Guarda la preferencia de bloqueo biométrico.
 */
export async function setBiometricEnabled(enabled) {
  await AsyncStorage.setItem(BIOMETRIC_KEY, JSON.stringify(enabled));
}

/**
 * Lee si el bloqueo biométrico está activado.
 */
export async function isBiometricEnabled() {
  try {
    const value = await AsyncStorage.getItem(BIOMETRIC_KEY);
    return value ? JSON.parse(value) : false;
  } catch {
    return false;
  }
}
