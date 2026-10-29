import { Alert } from 'react-native';
import { createPublicationApi } from './publicationService';
import {
  getPendingPublications,
  removePendingPublication,
} from '../storage/pendingSyncStorage';

const MAX_RETRIES = 3;
let isSyncing = false;

/**
 * Tenta sincronizar todas las publicaciones guardadas offline.
 * Descarta items con más de MAX_RETRIES intentos fallidos (imágenes expiradas, etc.).
 * @returns {Promise<number>} Cantidad de publicaciones sincronizadas exitosamente
 */
export async function syncPendingPublications() {
  if (isSyncing) return 0;
  isSyncing = true;

  let syncedCount = 0;
  let discardedCount = 0;
  try {
    const pendingItems = await getPendingPublications();
    if (!pendingItems || pendingItems.length === 0) {
      isSyncing = false;
      return 0;
    }

    for (const item of pendingItems) {
      const retries = item.retryCount || 0;

      // Si superó el máximo de reintentos, descartar
      if (retries >= MAX_RETRIES) {
        await removePendingPublication(item.offlineId);
        discardedCount++;
        continue;
      }

      try {
        await createPublicationApi(item.payload, item.images || []);
        await removePendingPublication(item.offlineId);
        syncedCount++;
      } catch (err) {
        // Incrementar el contador de reintentos en el storage
        await incrementRetryCount(item.offlineId);
        // Si falla, no frenar el resto — seguir con la siguiente
      }
    }

    if (syncedCount > 0) {
      Alert.alert(
        '¡Sincronización Exitosa!',
        `Se publicaron automáticamente ${syncedCount} publicación(es) que tenías pendiente(s) de envío.`
      );
    }

    if (discardedCount > 0) {
      Alert.alert(
        'Publicaciones descartadas',
        `${discardedCount} publicación(es) offline no pudieron sincronizarse después de varios intentos y fueron descartadas.`
      );
    }
  } catch (error) {
    // Error general silencioso — no interrumpir el uso de la app
  } finally {
    isSyncing = false;
  }

  return syncedCount;
}

/**
 * Incrementa el contador de reintentos de un item pendiente.
 */
async function incrementRetryCount(offlineId) {
  try {
    const pendingList = await getPendingPublications();
    const updated = pendingList.map((item) =>
      item.offlineId === offlineId
        ? { ...item, retryCount: (item.retryCount || 0) + 1 }
        : item
    );
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.setItem('@hallado_pending_publications_queue_v1', JSON.stringify(updated));
  } catch {
    // silencioso
  }
}
