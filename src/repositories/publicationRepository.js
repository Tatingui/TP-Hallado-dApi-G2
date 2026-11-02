import { database } from '../database';
import { Q } from '@nozbe/watermelondb';

export const getLocalPublications = async ({ type, category, query, barrio }) => {
  const collection = database.get('publications');
  const conditions = [];

  if (type) {
    // Inverse type match
    const targetType = type === 'LOST' ? 'FOUND' : 'LOST';
    conditions.push(Q.where('type', targetType));
  }

  if (category) {
    conditions.push(Q.where('category', category));
  }

  if (barrio) {
    conditions.push(Q.where('barrio', barrio));
  }

  if (conditions.length > 0) {
    return await collection.query(...conditions).fetch();
  }

  return await collection.query().fetch();
};

export const savePublicationsToLocal = async (publicationsList) => {
  const collection = database.get('publications');
  await database.write(async () => {
    for (const item of publicationsList) {
      const existing = await collection.query(Q.where('server_id', item.id)).fetch();
      if (existing.length === 0) {
        await collection.create((pub) => {
          pub.serverId = item.id;
          pub.title = item.title;
          pub.description = item.description || '';
          pub.type = item.type;
          pub.category = item.category;
          pub.barrio = item.barrio;
          pub.address = item.address || '';
          pub.latitude = item.latitude;
          pub.longitude = item.longitude;
          pub.eventDate = item.eventDate ? new Date(item.eventDate).getTime() : Date.now();
          pub.status = item.status;
          pub.publisherName = item.publisher ? item.publisher.nombre : '';
          pub.publisherPhone = item.publisher ? item.publisher.phone : '';
          pub.publisherReputation = item.publisher ? item.publisher.devolucionesConcretadas : 0;
          pub.createdAt = Date.now();
          pub.updatedAt = Date.now();
          pub.syncStatus = 'synced';
        });
      }
    }
  });
};
