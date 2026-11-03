import { enqueuePublication, getPendingOperations, removePending } from '../repositories/pendingRepository';
export const savePendingPublication = enqueuePublication;

export async function getPendingPublications() {
  const ops = await getPendingOperations();
  return (ops || []).map(row => {
    let data = {};
    try { data = JSON.parse(row.payloadJson || '{}'); } catch { /* json corrupto */ }
    return {
      offlineId: row.id,
      payload: data.publication || {},
      images: Array.isArray(data.images) ? data.images : [],
      createdAt: row.createdAt,
      status: row.state,
      lastError: row.lastError,
    };
  });
}

export async function getPendingByStatus(targetStatus) {
  const all = await getPendingPublications();
  return all.filter((item) => item.status === targetStatus);
}

export async function getPendingSummary() {
  const all = await getPendingPublications();
  const summary = { total: all.length, pending: 0, failed: 0, retrying: 0 };
  for (const item of all) {
    if (item.status === 'FAILED') summary.failed += 1;
    else if (item.status === 'RETRYING') summary.retrying += 1;
    else summary.pending += 1;
  }
  return summary;
}

export const removePendingPublication = removePending;
