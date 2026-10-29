import { apiGet, apiPostMultipart, apiPut } from "./api";
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

/**
 * Sube una imagen de perfil desde la galería.
 * @param {{ uri: string, type?: string, fileName?: string }} image
 * @returns {Promise<Object>} perfil actualizado con la nueva URL
 */
export async function uploadProfileImage(image) {
  const token = await getToken();
  const formData = new FormData();
  formData.append("image", {
    uri: image.uri,
    type: image.type || "image/jpeg",
    name: image.fileName || `profile_${Date.now()}.jpg`,
  });
  return apiPostMultipart("/usuarios/me/imagen", formData, token);
}

export async function getPublicProfile(userId) {
  const token = await getToken();
  return apiGet(`/usuarios/${userId}/publico`, token);
}
