import { apiGet, apiPut } from "./api";
import { getToken } from "../storage/authStorage";

/**
 * Servicio de Usuario y Perfil para comunicarse con el backend de Hallado.
 */

export async function getMyProfile() {
  const token = await getToken();
  return apiGet("/usuarios/me", token);
}

export async function updateMyProfile(profileData) {
  const token = await getToken();
  return apiPut("/usuarios/me", profileData, token);
}

export async function getPublicProfile(userId) {
  const token = await getToken();
  return apiGet(`/usuarios/${userId}/publico`, token);
}
