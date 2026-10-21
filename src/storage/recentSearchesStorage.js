import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = '@hallado_recent_searches_v1';
const MAX_RECENT_SEARCHES = 5;

export const getRecentSearches = async () => {
  try {
    const json = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error reading recent searches from AsyncStorage:', error);
    return [];
  }
};

export const saveRecentSearch = async (searchCriteria) => {
  try {
    const current = await getRecentSearches();

    // Create unique label/key for comparison
    const newEntry = {
      id: Date.now().toString(),
      type: searchCriteria.type, // LOST or FOUND
      category: searchCriteria.category || null,
      query: searchCriteria.query || '',
      barrio: searchCriteria.barrio || '',
      dateFilter: searchCriteria.dateFilter || 'ALL',
      startDate: searchCriteria.startDate || null,
      endDate: searchCriteria.endDate || null,
      timestamp: new Date().toISOString(),
    };

    // Filter out duplicate identical search
    const filtered = current.filter(
      (item) =>
        !(
          item.type === newEntry.type &&
          item.category === newEntry.category &&
          item.query.toLowerCase() === newEntry.query.toLowerCase() &&
          item.barrio === newEntry.barrio
        )
    );

    // Add to top and limit to MAX_RECENT_SEARCHES
    const updated = [newEntry, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error saving recent search:', error);
    return [];
  }
};

export const deleteRecentSearch = async (id) => {
  try {
    const current = await getRecentSearches();
    const updated = current.filter((item) => item.id !== id);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error deleting recent search:', error);
    return [];
  }
};

export const clearRecentSearches = async () => {
  try {
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    return [];
  } catch (error) {
    console.error('Error clearing recent searches:', error);
    return [];
  }
};
