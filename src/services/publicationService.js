import { authDelete, authGet, authPost, authPostMultipart, authPut } from "./api";

/**
 * Punto 3: busca publicaciones en el backend.
 */
export const searchPublicationsApi = async ({
  type,
  category,
  query,
  barrio,
  dateFilter,
  startDate,
  endDate,
  lat,
  lng,
  sortBy = "recent",
  page = 0,
  size = 10,
}) => {
  const params = new URLSearchParams();

  if (type) params.append("type", type);
  if (category) params.append("category", category);
  if (query && query.trim()) params.append("query", query.trim());
  if (barrio && barrio !== "Todos los barrios") params.append("barrio", barrio);
  if (dateFilter && dateFilter !== "ALL") params.append("dateFilter", dateFilter);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (lat != null) params.append("lat", String(lat));
  if (lng != null) params.append("lng", String(lng));
  if (sortBy) params.append("sortBy", sortBy);
  params.append("page", String(page));
  params.append("size", String(size));
  const data = await authGet(`/publications/search?${params.toString()}`);
  return data;
};

/**
 * Crea una publicación nueva.
 * Envía multipart/form-data: el campo "publication" con los datos en JSON
 * y, si hay, las imágenes como archivos en el campo "images".
 *
 * @param {Object} publication - Datos de la publicación
 * @param {string} publication.title
 * @param {string} publication.description
 * @param {string} publication.type - LOST | FOUND
 * @param {string} publication.category - CategoryEnum
 * @param {string} publication.barrio
 * @param {string} [publication.address]
 * @param {number} [publication.latitude]
 * @param {number} [publication.longitude]
 * @param {string} [publication.eventDate] - Fecha local "AAAA-MM-DDTHH:mm:ss" (ver utils/date)
 * @param {string} [publication.verificationQuestion] - Solo para FOUND
 * @param {string} [publication.verificationAnswer] - Solo para FOUND
 * @param {Array} [images] - Array de objetos { uri, type, fileName }
 */
export const createPublicationApi = async (publication, images = [], tokenParam = null, idempotencyKey = null) => {

  // Los datos viajan como una parte más del formulario: así el multipart nunca
  // queda vacío. En Android, un multipart sin partes (publicación sin fotos)
  // se rechaza antes de enviarse y la publicación quedaba pendiente para siempre.
  const formData = new FormData();
  formData.append("publication", JSON.stringify(publication));

  (images ?? []).forEach((img, index) => {
    formData.append("images", {
      uri: img.uri,
      type: img.type || "image/jpeg",
      name: img.fileName || `image_${index}.jpg`,
    });
  });

  return authPostMultipart("/publications", formData, tokenParam, idempotencyKey);
};

/**
 * Obtiene las publicaciones del usuario autenticado.
 * Paginado con Spring Data Page.
 *
 * @param {number} page
 * @param {number} size
 * @param {string} [status] - Filtro opcional por estado
 */
export const getMyPublicationsApi = async (page = 0, size = 10, status = null) => {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));
  if (status) params.append("status", status);

  const data = await authGet(`/publications/mine?${params.toString()}`);
  return data;
};

export const getFollowedPublicationsApi = async (page = 0, size = 3) => {
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));

  return authGet(`/publications/followed?${params.toString()}`);
};

/**
 * Punto 9: cantidad de publicaciones seguidas que cambiaron de estado desde la última vez que se vieron.
 */
export const getFollowedUpdatesCountApi = async () => {
  return authGet("/publications/followed/updates-count");
};

/**
 * Obtiene una publicación por su ID.
 *
 * @param {number} id
 */
export const getPublicationByIdApi = async (id) => {
  const data = await authGet(`/publications/${id}`);
  return data;
};

export const updatePublicationApi = async (id, publication) => {
  return authPut(`/publications/${id}`, publication);
};

export const getPublicationForEditApi = async (id) => {
  return authGet(`/publications/${id}/edit`);
};

export const getPublicationFollowStatusApi = async (id) => {
  return authGet(`/publications/${id}/follow`);
};

export const markPublicationAsSeenApi = async (id) => {
  return authPost(`/publications/${id}/seen`, {});
};

export const followPublicationApi = async (id) => {
  return authPost(`/publications/${id}/follow`, {});
};

export const unfollowPublicationApi = async (id) => {
  return authDelete(`/publications/${id}/follow`);
};

export const deletePublicationApi = async (id) => {
  return authDelete(`/publications/${id}`);
};

/**
 * Punto 5: renueva por otros 30 días una publicación vencida.
 */
export const renewPublicationApi = async (id) => {
  return authPost(`/publications/${id}/renew`, {});
};
