import { readLocal, writeLocal } from '../database/localStore';

/**
 * Búsquedas recientes del buscador guiado (Punto 3).
 * Se guardan por usuario en la base local (cache_entries de WatermelonDB).
 */
const STORAGE_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 5;

export const getRecentSearches = async () => {
  try {
    return await readLocal(STORAGE_KEY, []);
  } catch (error) {
    console.error('No se pudieron leer las búsquedas recientes:', error);
    return [];
  }
};

export const saveRecentSearch = async (searchCriteria) => {
  try {
    if (!searchCriteria) return await getRecentSearches();
    const current = await getRecentSearches();
    const cleanQuery = (searchCriteria.query || '').trim();
    const cleanBarrio = (searchCriteria.barrio || '').trim();
    const newEntry = {
      id: Date.now().toString(),
      type: searchCriteria.type,
      category: searchCriteria.category || null,
      query: cleanQuery,
      barrio: cleanBarrio,
      dateFilter: searchCriteria.dateFilter || 'ALL',
      startDate: searchCriteria.startDate || null,
      endDate: searchCriteria.endDate || null,
      timestamp: new Date().toISOString(),
    };

    // Una búsqueda repetida sube al principio en lugar de duplicarse.
    const withoutDuplicate = (Array.isArray(current) ? current : []).filter(
      (item) =>
        !(
          item &&
          item.type === newEntry.type &&
          item.category === newEntry.category &&
          (item.query || '').trim().toLowerCase() === newEntry.query.toLowerCase() &&
          (item.barrio || '').trim() === newEntry.barrio &&
          (item.dateFilter || 'ALL') === newEntry.dateFilter &&
          (item.startDate || null) === newEntry.startDate &&
          (item.endDate || null) === newEntry.endDate
        )
    );

    const updated = [newEntry, ...withoutDuplicate].slice(0, MAX_RECENT_SEARCHES);
    await writeLocal(STORAGE_KEY, updated);
    return updated;
  } catch (error) {
    console.error('No se pudo guardar la búsqueda reciente:', error);
    return [];
  }
};

export const clearRecentSearches = async () => {
  try {
    await writeLocal(STORAGE_KEY, []);
    return [];
  } catch (error) {
    console.error('No se pudieron borrar las búsquedas recientes:', error);
    return [];
  }
};
