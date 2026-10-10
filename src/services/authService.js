import { apiPost } from "./api";

/**
 * Equivalente a AuthApiService.java de Ronda.
 * Cada funcion llama a un endpoint de /api/auth/
 */

export function login(email, password) {
  return apiPost("/auth/login", { email, password });
}

export function register(nombre, email, password) {
  return apiPost("/auth/register", { nombre, email, password });
}

export function sendOtp(email) {
  return apiPost("/auth/otp/send", { email });
}

export function verifyOtp(email, code) {
  return apiPost("/auth/otp/verify", { email, code });
}

export function resendOtp(email) {
  return apiPost("/auth/otp/resend", { email });
}

export function resetPassword(email, code, newPassword) {
  return apiPost("/auth/password/reset", { email, code, newPassword });
}
