import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { assertCurrentSession, getDatabaseSession } from '../database/session';

export async function getLocalClaims(isReceived = false, session = getDatabaseSession()) {
  const rows = await database.get('claims').query(Q.where('owner', session.owner), Q.where('is_received', isReceived)).fetch();
  assertCurrentSession(session);
  return rows.filter(row => row.snapshotJson).map(row => JSON.parse(row.snapshotJson));
}

export async function saveClaimsToLocal(items, isReceived = false, session = getDatabaseSession()) {
  const collection = database.get('claims');
  await database.write(async () => {
    assertCurrentSession(session);
    for (const item of items) {
      const rows = await collection.query(Q.where('owner', session.owner), Q.where('server_id', Number(item.id)), Q.where('is_received', isReceived)).fetch();
      assertCurrentSession(session);
      const assign = row => {
        row.owner = session.owner;
        row.serverId = Number(item.id);
        row.snapshotJson = JSON.stringify(item);
        row.isReceived = isReceived;
        row.status = item.status;
        row.syncStatus = 'synced';
      };
      if (rows.length) await rows[0].update(assign);
      else await collection.create(assign);
    }
  });
}
