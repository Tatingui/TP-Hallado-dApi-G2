import { readLocal, writeLocal, updateLocal } from '../database/localStore';
import { getDatabaseSession, assertCurrentSession } from '../database/session';
import { cachePublicationImages } from '../services/files/fileSystemManager';
import { savePublicationsToLocal, getLocalPublications, removeLocalPublication } from '../repositories/publicationRepository';

export async function savePublicationDetailOffline(publication, session = getDatabaseSession()) {
  const cached = await cachePublicationImages(publication, session);
  assertCurrentSession(session);
  await savePublicationsToLocal([cached], session);
  return cached;
}
export async function saveSearchCacheOffline(items, session = getDatabaseSession()) {
  const cached = [];
  for (const item of items) cached.push(await savePublicationDetailOffline(item, session));
  await writeLocal('last_search', { timestamp: new Date().toISOString(), items: cached }, session);
}
export const getOfflineSearchCache = () => readLocal('last_search');
export async function getOfflinePublicationDetail(id) {
  return (await getLocalPublications()).find(item => String(item.id) === String(id)) || null;
}
export async function invalidateOfflinePublication(id, session = getDatabaseSession()) {
  await removeLocalPublication(id, session);
  await updateLocal('last_search', cache => cache ? { ...cache, items: cache.items.filter(item => String(item.id) !== String(id)) } : null, null, session);
}

