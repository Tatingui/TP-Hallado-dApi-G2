import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_SEARCH_CACHE_KEY = '@hallado_offline_search_cache_v1';

export const saveSearchCacheOffline = async (publicationsList) => {
  try {
    const dataToSave = {
      timestamp: new Date().toISOString(),
      items: publicationsList || [],
    };
    await AsyncStorage.setItem(OFFLINE_SEARCH_CACHE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Error saving search cache offline:', error);
  }
};

export const getOfflineSearchCache = async () => {
  try {
    const json = await AsyncStorage.getItem(OFFLINE_SEARCH_CACHE_KEY);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('Error getting offline search cache:', error);
    return null;
  }
};
