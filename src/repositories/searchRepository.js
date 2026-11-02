import { database } from '../database';

export const getLocalRecentSearches = async () => {
  const collection = database.get('recent_searches');
  return await collection.query().fetch();
};

export const saveLocalRecentSearch = async (searchData) => {
  const collection = database.get('recent_searches');
  await database.write(async () => {
    await collection.create((item) => {
      item.type = searchData.type || 'LOST';
      item.category = searchData.category || '';
      item.query = searchData.query || '';
      item.barrio = searchData.barrio || '';
      item.dateFilter = searchData.dateFilter || 'ALL';
      item.timestamp = Date.now();
    });
  });
};
