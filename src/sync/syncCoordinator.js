import NetInfo from '@react-native-community/netinfo';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { getToken } from '../storage/authStorage';
import { createPublicationApi } from '../services/publicationService';
import { createClaimApi, respondToClaimApi } from '../services/claimService';
import { 'v4' as uuidv4 } from 'uuid';

let isSyncRunning = false;

export const queuePendingOperation = async (type, payload) => {
  const collection = database.get('pending_operations');
  const idempotencyKey = uuidv4();

  await database.write(async () => {
    await collection.create((op) => {
      op.idempotencyKey = idempotencyKey;
      op.operationType = type; // 'CREATE_PUBLICATION' | 'CREATE_CLAIM' | 'RESPOND_CLAIM'
      op.payloadJson = JSON.stringify(payload);
      op.retryCount = 0;
      op.createdAt = Date.now();
      op.updatedAt = Date.now();
    });
  });

  // Attempt sync immediately if online
  triggerSyncProcess();
};

export const triggerSyncProcess = async () => {
  if (isSyncRunning) return; // Rule: Una sola ejecución a la vez

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return; // No network

  const token = await getToken();
  if (!token) return; // Pausar ante sesión vencida

  isSyncRunning = true;

  try {
    const collection = database.get('pending_operations');
    const pendingOps = await collection.query(Q.sortBy('created_at', Q.asc)).fetch();

    for (const op of pendingOps) {
      try {
        const payload = JSON.parse(op.payloadJson);

        if (op.operationType === 'CREATE_PUBLICATION') {
          await createPublicationApi(payload, payload.images, token, op.idempotencyKey);
        } else if (op.operationType === 'CREATE_CLAIM') {
          await createClaimApi(payload.publicationId, payload.proofMessage, payload.verificationAnswer, payload.imageUri, token, op.idempotencyKey);
        } else if (op.operationType === 'RESPOND_CLAIM') {
          await respondToClaimApi(payload.claimId, payload.status, token, op.idempotencyKey);
        }

        // Success: Remove operation from local queue
        await database.write(async () => {
          await op.destroyPermanently();
        });
      } catch (error) {
        console.warn(`Sync failed for operation ${op.id}:`, error);

        // Pause on Auth errors (401, 403)
        if (error && (error.status === 401 || error.status === 403)) {
          break;
        }

        // Increment retry count for temporary network errors
        await database.write(async () => {
          await op.update((record) => {
            record.retryCount += 1;
            record.lastError = error ? error.message || 'Error de red' : 'Error desconocido';
            record.updatedAt = Date.now();
          });
        });
      }
    }
  } catch (globalError) {
    console.error('Error during Sync Coordinator execution:', globalError);
  } finally {
    isSyncRunning = false;
  }
};

// Escuchar cambios de red automáticamente para disparar sincronización
NetInfo.addEventListener((state) => {
  if (state.isConnected) {
    triggerSyncProcess();
  }
});
