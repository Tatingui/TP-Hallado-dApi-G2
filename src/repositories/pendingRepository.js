import { Q } from '@nozbe/watermelondb';
import { randomUUID } from 'expo-crypto';
import { database } from '../database';
import { getDatabaseSession, assertCurrentSession } from '../database/session';
import { persistImages } from '../services/files/fileSystemManager';

export async function enqueuePublication(payload, images = [], options = {}) {
  const session = options.session || getDatabaseSession();
  const key = options.idempotencyKey || randomUUID();
  let durableImages;
  let imageError = '';
  try { durableImages = await persistImages(images, session); }
  catch (error) {
    if (!options.recovery) throw error;
    durableImages = images;
    imageError = error.message;
  }
  return database.write(async () => {
    assertCurrentSession(session);
    const operations = database.get('pending_operations');
    const existing = await operations.query(Q.where('owner', session.owner), Q.where('idempotency_key', key)).fetch();
    if (existing.length) return existing[0].id;
    const publication = database.get('publications').prepareCreate(row => {
      row.owner = session.owner;
      row.title = payload.title || '';
      row.type = payload.type || '';
      row.category = payload.category || '';
      row.barrio = payload.barrio || '';
      row.status = 'PENDIENTE_ENVIO';
      row.snapshotJson = JSON.stringify(payload);
      row.syncStatus = 'pending_create';
      row.createdAt = new Date();
      row.updatedAt = new Date();
    });
    const operation = operations.prepareCreate(row => {
      row.owner = session.owner;
      row.operationType = 'CREATE_PUBLICATION';
      row.idempotencyKey = key;
      row.publicationLocalId = publication.id;
      row.payloadJson = JSON.stringify({ publication: payload, images: durableImages });
      row.state = imageError ? 'blocked' : 'pending';
      row.lastError = imageError;
      row.retryCount = 0;
      row.nextAttemptAt = 0;
      row.createdAt = new Date();
      row.updatedAt = new Date();
    });
    await database.batch(publication, operation);
    return operation.id;
  });
}
export async function getPendingOperations(session = getDatabaseSession()) {
  const rows = await database.get('pending_operations').query(Q.where('owner', session.owner), Q.sortBy('created_at', Q.asc)).fetch();
  assertCurrentSession(session);
  return rows;
}
export async function completeOperation(operation, result, session) {
  if (result?.id == null) throw new Error('El servidor no confirmó el ID de la publicación.');
  await database.write(async () => {
    assertCurrentSession(session);
    const publication = await database.get('publications').find(operation.publicationLocalId);
    const duplicates = await database.get('publications').query(Q.where('owner', session.owner), Q.where('server_id', Number(result.id))).fetch();
    await database.batch(
      ...duplicates.filter(row => row.id !== publication.id).map(row => row.prepareDestroyPermanently()),
      publication.prepareUpdate(row => {
        row.serverId = Number(result.id);
        row.snapshotJson = JSON.stringify(result);
        row.status = result.status;
        row.syncStatus = 'synced';
        row.updatedAt = new Date();
      }),
      operation.prepareDestroyPermanently(),
    );
  });
}
export async function removePending(id) {
  const session = getDatabaseSession();
  await database.write(async () => {
    const row = await database.get('pending_operations').find(id);
    assertCurrentSession(session);
    if (row.owner !== session.owner) throw new Error('Operación de otra cuenta.');
    const publication = await database.get('publications').find(row.publicationLocalId);
    await database.batch(row.prepareDestroyPermanently(), publication.prepareDestroyPermanently());
  });
}

