import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import { database } from '../database';
import { getDatabaseSession, isCurrentSession, assertCurrentSession } from '../database/session';
import { getPendingOperations, completeOperation, enqueuePublication } from '../repositories/pendingRepository';
import { createPublicationApi } from '../services/publicationService';
import { isTokenExpired } from '../storage/authStorage';
import { createSyncEngine } from './syncEngine';

export const triggerSyncProcess = createSyncEngine({
  getSession: () => { try { const session = getDatabaseSession(); return !session.ready || isTokenExpired(session.token) ? null : session; } catch { return null; } },
  isCurrent: isCurrentSession,
  isOnline: async () => (await NetInfo.fetch()).isConnected === true,
  list: getPendingOperations,
  send: (op, session) => {
    const { publication, images } = JSON.parse(op.payloadJson);
    return createPublicationApi(publication, images, session.token, op.idempotencyKey);
  },
  complete: completeOperation,
  fail: (op, failure, session) => database.write(async () => {
    assertCurrentSession(session);
    await op.update(row => {
      row.state = failure.state;
      row.lastError = failure.message;
      row.retryCount += 1;
      row.nextAttemptAt = failure.nextAttemptAt || 0;
      row.updatedAt = new Date();
    });
  }),
});

export async function queuePendingOperation(type, payload) {
  if (type !== 'CREATE_PUBLICATION') throw new Error('Los reclamos y sus respuestas requieren conexión.');
  const id = await enqueuePublication(payload.publication || payload, payload.images || []);
  triggerSyncProcess().catch(() => {});
  return id;
}

export function startSyncCoordinator() {
  const run = () => { if (AppState.currentState === 'active') triggerSyncProcess().catch(error => console.warn('No se pudo sincronizar:', error.message)); };
  const network = NetInfo.addEventListener(state => { if (state.isConnected) run(); });
  const foreground = AppState.addEventListener('change', state => { if (state === 'active') run(); });
  const timer = setInterval(run, 15000);
  run();
  return () => { network(); foreground.remove(); clearInterval(timer); };
}
