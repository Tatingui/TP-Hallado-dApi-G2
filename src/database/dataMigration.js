import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { Q } from '@nozbe/watermelondb';
import { database } from './index';
import { assertCurrentSession, getDatabaseSession } from './session';
import { readLocal, writeLocal } from './localStore';
import { enqueuePublication } from '../repositories/pendingRepository';
import { saveSearchCacheOffline, savePublicationDetailOffline } from '../storage/offlinePublicationsStorage';
import { persistImages } from '../services/files/fileSystemManager';

const KEYS = ['hallado_publication_draft', '@hallado_pending_publications_queue_v1',
  '@hallado_recent_searches_v1', '@hallado_offline_search_cache_v1',
  '@hallado_offline_pub_details_v1', '@hallado_followed_publications_v1'];
const LEGACY_OWNER = '__legacy_unassigned__';

// A single SQLite record preserves an immutable backup. No AsyncStorage keys are deleted.
async function legacySnapshot() {
  const values = await AsyncStorage.multiGet(KEYS);
  return database.write(async () => {
    const collection = database.get('cache_entries');
    const rows = await collection.query(Q.where('owner', LEGACY_OWNER), Q.where('cache_key', 'migration_v2')).fetch();
    if (rows.length) return rows[0];
    return collection.create(row => {
      row.owner = LEGACY_OWNER;
      row.cacheKey = 'migration_v2';
      row.valueJson = JSON.stringify({ raw: Object.fromEntries(values), owner: null, complete: false });
    });
  });
}

export async function migrateAsyncStorageToWatermelon(session = getDatabaseSession()) {
  const record = await legacySnapshot();
  let backup = JSON.parse(record.valueJson);
  assertCurrentSession(session);
  if (backup.complete || !Object.values(backup.raw).some(Boolean)) return;
  if (backup.owner && backup.owner !== session.owner) return;
  if (!backup.owner) {
    const accepted = await new Promise(resolve => Alert.alert(
      'Recuperar datos anteriores',
      'Hay datos de la versión anterior sin una cuenta identificada. Recuperalos solamente si los borradores y publicaciones pendientes son tuyos. Se conservará una copia.',
      [{ text: 'Ahora no', onPress: () => resolve(false) }, { text: 'Son míos, recuperar', onPress: () => resolve(true) }],
      { cancelable: false },
    ));
    if (!accepted) return;
    await database.write(async () => {
      assertCurrentSession(session);
      const current = JSON.parse(record.valueJson);
      if (current.owner && current.owner !== session.owner) throw new Error('Los datos ya fueron asignados a otra cuenta.');
      await record.update(row => { row.valueJson = JSON.stringify({ ...current, owner: session.owner }); });
    });
    backup = JSON.parse(record.valueJson);
  }
  const parse = (key, fallback) => backup.raw[key] ? JSON.parse(backup.raw[key]) : fallback;
  // Each step is idempotent. The completion marker is written only after all steps succeed.
  const draft = parse(KEYS[0], null);
  if (draft && !(await readLocal('legacy_draft_imported', false, session))) {
    let recovered = draft;
    try { recovered = { ...draft, images: await persistImages(draft.images || [], session) }; }
    catch (error) { recovered = { ...draft, recoveryWarning: error.message }; }
    if (!(await readLocal('draft', null, session))) await writeLocal('draft', recovered, session);
    else await writeLocal('recovered_legacy_draft', recovered, session);
    await writeLocal('legacy_draft_imported', true, session);
  }
  const pending = parse(KEYS[1], []);
  for (let i = 0; i < pending.length; i += 1) {
    const item = pending[i];
    await enqueuePublication(item.payload, item.images || [], {
      session, recovery: true, idempotencyKey: 'legacy-' + (item.offlineId || i),
    });
  }
  if (!(await readLocal('legacy_searches_imported', false, session))) {
    const existing = await readLocal('recent_searches', [], session);
    if (!existing.length) await writeLocal('recent_searches', parse(KEYS[2], []), session);
    await writeLocal('legacy_searches_imported', true, session);
  }
  const cache = parse(KEYS[3], null);
  if (cache?.items && !(await readLocal('last_search', null, session))) await saveSearchCacheOffline(cache.items, session);
  for (const publication of Object.values(parse(KEYS[4], {}))) await savePublicationDetailOffline(publication, session);
  const follows = parse(KEYS[5], {});
  await writeLocal('legacy_followed_ids', follows[session.owner] || [], session);
  await database.write(async () => {
    assertCurrentSession(session);
    await record.update(row => { row.valueJson = JSON.stringify({ ...backup, complete: true }); });
  });
}

