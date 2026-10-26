import { getToken } from "../storage/authStorage";
import { apiDelete, apiGet, apiPost, apiPostMultipart, apiPut } from "./api";

/**
 * Busca publicaciones en el backend (endpoint de Agus).
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

  const token = await getToken();
  const data = await apiGet(`/publications/search?${params.toString()}`, token);
  return data;
};

/**
 * Crea una publicación nueva.
 * Envía multipart/form-data con las imágenes como archivos
 * y los datos de la publicación como campo JSON.
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
 * @param {string} [publication.eventDate] - ISO string
 * @param {string} [publication.verificationQuestion] - Solo para FOUND
 * @param {string} [publication.verificationAnswer] - Solo para FOUND
 * @param {Array} [images] - Array de objetos { uri, type, fileName }
 */
export const createPublicationApi = async (publication, images = []) => {
  const token = await getToken();

  // Enviar datos de publicación como query param y las imágenes en FormData.
  // React Native tiene problemas al mezclar strings y archivos en FormData.
  const publicationParam = encodeURIComponent(JSON.stringify(publication));
  const url = "/publications?publication=" + publicationParam;

  const formData = new FormData();

  // Imágenes como archivos adjuntos (solo si hay)
  if (images && images.length > 0) {
    images.forEach((img, index) => {
      formData.append("images", {
        uri: img.uri,
        type: img.type || "image/jpeg",
        name: img.fileName || `image_${index}.jpg`,
      });
    });
  }

  const data = await apiPostMultipart(url, formData, token);
  return data;
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
  const token = await getToken();
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));
  if (status) params.append("status", status);

  const data = await apiGet(`/publications/mine?${params.toString()}`, token);
  return data;
};

export const getFollowedPublicationsApi = async (page = 0, size = 3) => {
  const token = await getToken();
  const params = new URLSearchParams();
  params.append("page", String(page));
  params.append("size", String(size));

  return apiGet(`/publications/followed?${params.toString()}`, token);
};

/**
 * Obtiene una publicación por su ID.
 *
 * @param {number} id
 */
export const getPublicationByIdApi = async (id) => {
  const token = await getToken();
  const data = await apiGet(`/publications/${id}`, token);
  return data;
};

export const updatePublicationApi = async (id, publication) => {
  const token = await getToken();
  return apiPut(`/publications/${id}`, publication, token);
};

export const getPublicationForEditApi = async (id) => {
  const token = await getToken();
  return apiGet(`/publications/${id}/edit`, token);
};

export const getPublicationFollowStatusApi = async (id) => {
  const token = await getToken();
  return apiGet(`/publications/${id}/follow`, token);
};

export const markPublicationAsSeenApi = async (id) => {
  const token = await getToken();
  return apiPost(`/publications/${id}/seen`, {}, token);
};

export const followPublicationApi = async (id) => {
  const token = await getToken();
  return apiPost(`/publications/${id}/follow`, {}, token);
};

export const unfollowPublicationApi = async (id) => {
  const token = await getToken();
  return apiDelete(`/publications/${id}/follow`, token);
};
