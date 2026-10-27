import { Alert } from 'react-native';
import { createPublicationApi } from './publicationService';
import {
  getPendingPublications,
  removePendingPublication,
} from '../storage/pendingSyncStorage';
import { checkNetworkConnection } from '../hooks/useNetworkStatus';

let isSyncing = false;

/**
 * Tenta sincronizar todas las publicaciones guardadas offline cuando hay conexión.
 * @returns {Promise<number>} Cantidad de publicaciones sincronizadas exitosamente
 */
export async function syncPendingPublications() {
  if (isSyncing) return 0;
  isSyncing = true;

  let syncedCount = 0;
  try {
    const pendingItems = await getPendingPublications();
    if (!pendingItems || pendingItems.length === 0) {
      isSyncing = false;
      return 0;
    }

    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      isSyncing = false;
      return 0;
    }

    for (const item of pendingItems) {
      try {
        await createPublicationApi(item.payload, item.images || []);
        await removePendingPublication(item.offlineId);
        syncedCount++;
      } catch (err) {
        console.warn(`Error al sincronizar publicación offline ${item.offlineId}:`, err);
        // Si falla por red u otro motivo, frenamos la sincronización para reintentar luego
        break;
      }
    }

    if (syncedCount > 0) {
      Alert.alert(
        '¡Sincronización Exitosa!',
        `Se publicaron automáticamente ${syncedCount} publicación(es) que tenías pendiente(s) de envío.`
      );
    }
  } catch (error) {
    console.error('Error durante la sincronización automática offline:', error);
  } finally {
    isSyncing = false;
  }

  return syncedCount;
}
