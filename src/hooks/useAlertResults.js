import { useEffect, useState } from "react";
import {
  getAlertPublicationsApi,
  markAlertAsSeenApi,
} from "../services/alertService";

/**
 * Hook que encapsula la carga paginada de las publicaciones que coinciden con una alerta.
 * Carga la primera página cada vez que cambia el id, marca la alerta como vista
 * después de cargarla y expone el paginado (loadMore) y el reintento (loadFirstPage).
 */
export default function useAlertResults(id) {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFirstPage();
  }, [id]);

  const loadFirstPage = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAlertPublicationsApi(id, 0, 10);
      setPublications(data?.content || []);
      setPage(data?.pageNumber || 0);
      setIsLastPage(data?.last ?? true);
      // Se marca como vista después de cargar, así las nuevas siguen marcadas en esta pantalla
      await markAlertAsSeenApi(id);
    } catch (err) {
      setError(err?.message || "No se pudieron cargar las publicaciones de la alerta.");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || isLastPage || loading) return;
    try {
      setLoadingMore(true);
      const data = await getAlertPublicationsApi(id, page + 1, 10);
      setPublications((prev) => [...prev, ...(data?.content || [])]);
      setPage(data?.pageNumber || page + 1);
      setIsLastPage(data?.last ?? true);
    } catch (err) {
      console.warn("Error cargando más resultados de la alerta:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return {
    publications,
    loading,
    loadingMore,
    error,
    loadFirstPage,
    loadMore,
  };
}
