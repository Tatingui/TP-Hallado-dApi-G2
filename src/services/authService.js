import { apiPost } from "./api";

/**
 * Llamadas a los endpoints de /api/auth/.
 * Todas devuelven { success, message, token?, requiresVerification? }.
 */

export function login(email, password) {
  return apiPost("/auth/login", { email, password });
}

// ─── Registro (Punto 1): email → código → nombre y contraseña ───

/** Envía (o reenvía) el código de verificación al email a registrar. */
export function startRegistration(email) {
  return apiPost("/auth/register/start", { email });
}

export function verifyRegistrationCode(email, code) {
  return apiPost("/auth/register/verify", { email, code });
}

/** Crea la cuenta y devuelve el token de sesión. */
export function completeRegistration(email, code, nombre, password) {
  return apiPost("/auth/register/complete", { email, code, nombre, password });
}

// ─── Verificación de cuentas existentes ───

export function sendOtp(email) {
  return apiPost("/auth/otp/send", { email });
}

export function verifyOtp(email, code) {
  return apiPost("/auth/otp/verify", { email, code });
}

export function resendOtp(email) {
  return apiPost("/auth/otp/resend", { email });
}

// ─── Recupero de contraseña ───

/** Valida el código sin consumirlo; se consume al definir la nueva contraseña. */
export function verifyResetCode(email, code) {
  return apiPost("/auth/password/verify", { email, code });
}

export function resetPassword(email, code, newPassword) {
  return apiPost("/auth/password/reset", { email, code, newPassword });
}
