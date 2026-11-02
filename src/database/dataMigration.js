import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from './index';

const MIGRATION_COMPLETED_KEY = '@hallado_watermelon_migration_v1';

export const migrateAsyncStorageToWatermelon = async () => {
  try {
    const isMigrated = await AsyncStorage.getItem(MIGRATION_COMPLETED_KEY);
    if (isMigrated === 'true') {
      return; // Migration already done
    }

    // 1. Migrate Recent Searches
    const recentSearchesJson = await AsyncStorage.getItem('@hallado_recent_searches_v1');
    if (recentSearchesJson) {
      const searches = JSON.parse(recentSearchesJson);
      const collection = database.get('recent_searches');
      await database.write(async () => {
        for (const item of searches) {
          await collection.create((rec) => {
            rec.type = item.type || 'LOST';
            rec.category = item.category || '';
            rec.query = item.query || '';
            rec.barrio = item.barrio || '';
            rec.dateFilter = item.dateFilter || 'ALL';
            rec.timestamp = item.timestamp ? new Date(item.timestamp).getTime() : Date.now();
          });
        }
      });
    }

    // 2. Migrate Offline Cache
    const offlineCacheJson = await AsyncStorage.getItem('@hallado_offline_search_cache_v1');
    if (offlineCacheJson) {
      const cache = JSON.parse(offlineCacheJson);
      if (cache.items && cache.items.length > 0) {
        const collection = database.get('publications');
        await database.write(async () => {
          for (const item of cache.items) {
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
              pub.status = item.status || 'OPEN';
              pub.createdAt = Date.now();
              pub.updatedAt = Date.now();
              pub.syncStatus = 'synced';
            });
          }
        });
      }
    }

    // Mark migration as completed
    await AsyncStorage.setItem(MIGRATION_COMPLETED_KEY, 'true');
  } catch (error) {
    console.error('Error during AsyncStorage to WatermelonDB migration:', error);
  }
};
