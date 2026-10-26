import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_PUBLICATIONS_KEY = '@hallado_pending_publications_queue_v1';

/**
 * Guarda una publicación realizada sin conexión en la cola de envíos pendientes.
 *
 * @param {Object} publicationPayload - Datos del formulario de publicación
 * @param {Array} images - Lista de imágenes seleccionadas (URIs locales)
 * @returns {Object} Objeto guardado con ID local temporal
 */
export async function savePendingPublication(publicationPayload, images = []) {
  try {
    const pendingList = await getPendingPublications();
    const offlineItem = {
      offlineId: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      payload: publicationPayload,
      images: images || [],
      createdAt: new Date().toISOString(),
      status: 'PENDIENTE_ENVIO',
    };

    pendingList.push(offlineItem);
    await AsyncStorage.setItem(PENDING_PUBLICATIONS_KEY, JSON.stringify(pendingList));
    return offlineItem;
  } catch (error) {
    console.error('Error al guardar publicación pendiente offline:', error);
    throw error;
  }
}

/**
 * Recupera todas las publicaciones pendientes de envío guardadas localmente.
 * @returns {Array} Lista de publicaciones pendientes
 */
export async function getPendingPublications() {
  try {
    const raw = await AsyncStorage.getItem(PENDING_PUBLICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error al obtener publicaciones pendientes:', error);
    return [];
  }
}

/**
 * Elimina una publicación de la cola de pendientes tras ser sincronizada exitosamente.
 * @param {string} offlineId - Identificador local de la publicación
 */
export async function removePendingPublication(offlineId) {
  try {
    const pendingList = await getPendingPublications();
    const updated = pendingList.filter((item) => item.offlineId !== offlineId);
    await AsyncStorage.setItem(PENDING_PUBLICATIONS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error al eliminar publicación pendiente:', error);
  }
}

/**
 * Limpia todas las publicaciones pendientes de la memoria.
 */
export async function clearPendingPublications() {
  try {
    await AsyncStorage.removeItem(PENDING_PUBLICATIONS_KEY);
  } catch (error) {
    console.error('Error al limpiar la cola de publicaciones pendientes:', error);
  }
}
