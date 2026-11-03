import { authGet, authPostMultipart, authPut } from "./api";

/**
 * Servicio de Usuario y Perfil para comunicarse con el backend de Hallado.
 */

export async function getMyProfile() {
  return authGet("/usuarios/me");
}

export async function updateMyProfile(profileData) {
  return authPut("/usuarios/me", profileData);
}

/**
 * Sube una imagen de perfil desde la galería.
 * @param {{ uri: string, type?: string, fileName?: string }} image
 * @returns {Promise<Object>} perfil actualizado con la nueva URL
 */
export async function uploadProfileImage(image) {
  const formData = new FormData();
  formData.append("image", {
    uri: image.uri,
    type: image.type || "image/jpeg",
    name: image.fileName || `profile_${Date.now()}.jpg`,
  });
  return authPostMultipart("/usuarios/me/imagen", formData);
}

export async function getPublicProfile(userId) {
  return authGet(`/usuarios/${userId}/publico`);
}
