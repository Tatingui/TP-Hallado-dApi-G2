import { useState, useEffect } from 'react';
import { getLocalPublications, savePublicationsToLocal } from '../repositories/publicationRepository';
import { searchPublicationsApi } from '../services/publicationService';

export function usePublications(searchCriteria = {}) {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    loadPublications();
  }, [JSON.stringify(searchCriteria)]);

  const loadPublications = async () => {
    setLoading(true);
    setIsOfflineMode(false);

    try {
      // 1. Intentar cargar desde el Backend (Servicios HTTP)
      const remoteData = await searchPublicationsApi({
        type: searchCriteria.type,
        category: searchCriteria.category,
        query: searchCriteria.query,
        barrio: searchCriteria.barrio,
        dateFilter: searchCriteria.dateFilter,
        page: 0,
        size: 20,
      });

      const remoteItems = remoteData.content || [];
      setPublications(remoteItems);

      // Guardar copia local en WatermelonDB (Etapa 4)
      await savePublicationsToLocal(remoteItems);
    } catch (error) {
      console.warn('Conexión remota fallida. Cargando desde WatermelonDB SQLite local:', error);

      // 2. Fallback local desde WatermelonDB Repositorio
      const localItems = await getLocalPublications(searchCriteria);
      setPublications(localItems);
      setIsOfflineMode(true);
    } finally {
      setLoading(false);
    }
  };

  return { publications, loading, isOfflineMode, refetch: loadPublications };
}
