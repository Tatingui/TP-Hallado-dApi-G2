import { useState } from 'react';
import {
  clearRecentSearches,
  getRecentSearches,
  saveRecentSearch,
} from '../storage/recentSearchesStorage';

/**
 * Hook para las búsquedas recientes del Buscador Guiado (Punto 3).
 * Expone la lista y las acciones para recargarla, guardar una búsqueda y borrarlas.
 */
export default function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState([]);

  const loadRecentSearches = async () => {
    const list = await getRecentSearches();
    setRecentSearches(list);
  };

  // Guarda la búsqueda en el storage; la lista se refresca la próxima vez que se abre el modal.
  const addRecentSearch = async (searchParams) => {
    await saveRecentSearch(searchParams);
  };

  const clearRecent = async () => {
    await clearRecentSearches();
    setRecentSearches([]);
  };

  return { recentSearches, loadRecentSearches, addRecentSearch, clearRecent };
}
