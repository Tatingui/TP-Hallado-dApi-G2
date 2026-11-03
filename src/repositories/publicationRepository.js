import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { assertCurrentSession, getDatabaseSession } from '../database/session';
import { PublicationStatus } from '../constants/publicationConstants';

export async function getLocalPublications(session = getDatabaseSession()) {
  const rows = await database.get('publications').query(Q.where('owner', session.owner)).fetch();
  assertCurrentSession(session);
  return rows.filter(row => row.syncStatus === 'synced' && row.snapshotJson).map(row => JSON.parse(row.snapshotJson));
}

export async function savePublicationsToLocal(items, session = getDatabaseSession()) {
  const collection = database.get('publications');
  await database.write(async () => {
    assertCurrentSession(session);
    for (const item of items) {
      if (item.id == null) continue;
      const rows = await collection.query(Q.where('owner', session.owner), Q.where('server_id', Number(item.id))).fetch();
      assertCurrentSession(session);
      const assign = pub => {
        pub.owner = session.owner;
        pub.serverId = Number(item.id);
        pub.title = item.title || '';
        pub.description = item.description || '';
        pub.type = item.type || '';
        pub.category = item.category || '';
        pub.barrio = item.barrio || '';
        pub.status = item.status || PublicationStatus.OPEN;
        pub.snapshotJson = JSON.stringify(item);
        pub.updatedAt = new Date();
        pub.syncStatus = 'synced';
      };
      if (rows.length) {
        if (rows[0].syncStatus === 'synced') await rows[0].update(assign);
      } else await collection.create(pub => { assign(pub); pub.createdAt = new Date(); });
    }
  });
}

export async function removeLocalPublication(id, session = getDatabaseSession()) {
  await database.write(async () => {
    assertCurrentSession(session);
    const rows = await database.get('publications').query(Q.where('owner', session.owner), Q.where('server_id', Number(id))).fetch();
    await database.batch(...rows.map(row => row.prepareDestroyPermanently()));
  });
}
