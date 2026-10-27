import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_SEARCH_CACHE_KEY = '@hallado_offline_search_cache_v1';
const OFFLINE_PUB_DETAILS_KEY = '@hallado_offline_pub_details_v1';

export const saveSearchCacheOffline = async (publicationsList) => {
  try {
    const dataToSave = {
      timestamp: new Date().toISOString(),
      items: publicationsList || [],
    };
    await AsyncStorage.setItem(OFFLINE_SEARCH_CACHE_KEY, JSON.stringify(dataToSave));

    // También guardamos individualmente los detalles de las publicaciones de los resultados de búsqueda
    if (Array.isArray(publicationsList)) {
      for (const pub of publicationsList) {
        if (pub && pub.id) {
          await savePublicationDetailOffline(pub);
        }
      }
    }
  } catch (error) {
    console.error('Error saving search cache offline:', error);
  }
};

export const getOfflineSearchCache = async () => {
  try {
    const json = await AsyncStorage.getItem(OFFLINE_SEARCH_CACHE_KEY);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('Error getting offline search cache:', error);
    return null;
  }
};

/**
 * Guarda el detalle de una publicación específica en la memoria local del dispositivo.
 * Conserva el detalle completo, fotos y barrio para permitir consultas sin conexión.
 *
 * @param {Object} publication - Objeto con la información detallada de la publicación
 */
export const savePublicationDetailOffline = async (publication) => {
  if (!publication || !publication.id) return;
  try {
    const json = await AsyncStorage.getItem(OFFLINE_PUB_DETAILS_KEY);
    const detailsMap = json ? JSON.parse(json) : {};

    detailsMap[publication.id] = {
      ...publication,
      _cachedAt: new Date().toISOString(),
    };

    // Mantener un límite de máximo 50 publicaciones recientes guardadas localmente
    const keys = Object.keys(detailsMap);
    if (keys.length > 50) {
      const oldestKey = keys.shift();
      delete detailsMap[oldestKey];
    }

    await AsyncStorage.setItem(OFFLINE_PUB_DETAILS_KEY, JSON.stringify(detailsMap));
  } catch (error) {
    console.error('Error saving publication detail offline:', error);
  }
};

/**
 * Recupera una publicación guardada en la memoria local por su ID.
 *
 * @param {number|string} pubId - ID de la publicación
 * @returns {Object|null} Objeto de la publicación guardada o null si no existe
 */
export const getOfflinePublicationDetail = async (pubId) => {
  if (!pubId) return null;
  try {
    const json = await AsyncStorage.getItem(OFFLINE_PUB_DETAILS_KEY);
    if (!json) return null;
    const detailsMap = JSON.parse(json);
    return detailsMap[pubId] || null;
  } catch (error) {
    console.error('Error getting offline publication detail:', error);
    return null;
  }
};
