import { Q } from '@nozbe/watermelondb';
import { database } from './index';
import { assertCurrentSession, getDatabaseSession } from './session';

const entries = () => database.get('cache_entries');
const query = (key, session) => entries().query(Q.where('owner', session.owner), Q.where('cache_key', key));

export async function readLocal(key, fallback = null, session = getDatabaseSession()) {
  const rows = await query(key, session).fetch();
  assertCurrentSession(session);
  return rows.length ? JSON.parse(rows[0].valueJson) : fallback;
}

// Todas las lecturas-modificaciones-escrituras corren dentro del mismo writer de la base.
export async function updateLocal(key, updater, fallback = null, session = getDatabaseSession()) {
  return database.write(async () => {
    assertCurrentSession(session);
    const rows = await query(key, session).fetch();
    const value = updater(rows.length ? JSON.parse(rows[0].valueJson) : fallback);
    assertCurrentSession(session);
    if (rows.length) {
      await rows[0].update((row) => { row.valueJson = JSON.stringify(value); });
    } else {
      await entries().create((row) => {
        row.owner = session.owner;
        row.cacheKey = key;
        row.valueJson = JSON.stringify(value);
      });
    }
    return value;
  });
}

export const writeLocal = (key, value, session) => updateLocal(key, () => value, null, session);
