import { enqueuePublication, getPendingOperations, removePending } from '../repositories/pendingRepository';
export const savePendingPublication = enqueuePublication;
export async function getPendingPublications() {
  return (await getPendingOperations()).map(row => {
    const data = JSON.parse(row.payloadJson);
    return { offlineId: row.id, payload: data.publication, images: data.images, createdAt: row.createdAt, status: row.state, lastError: row.lastError };
  });
}
export const removePendingPublication = removePending;

