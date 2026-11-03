import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  getFollowedPublicationsApi,
  markPublicationAsSeenApi,
} from "../services/publicationService";

/**
 * Hook que encapsula el listado paginado de publicaciones seguidas:
 * carga la primera página cada vez que la pantalla gana foco, pagina con loadMore
 * y marca como vista una publicación con novedades (markAsSeen).
 */
export default function useFollowedPublications() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(true);
  const [error, setError] = useState(null);

  const loadFirstPage = useCallback(async () => {
    try {
      setError(null);
      const data = await getFollowedPublicationsApi(0, 10);
      setPublications(data?.content || []);
      setPage(data?.pageNumber || 0);
      setIsLastPage(data?.last ?? true);
    } catch (err) {
      setError(err?.message || "No se pudieron cargar las publicaciones seguidas.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Se recarga al volver del detalle (por si se dejó de seguir o se vio una novedad)
  useFocusEffect(
    useCallback(() => {
      loadFirstPage();
    }, [loadFirstPage]),
  );

  const loadMore = async () => {
    if (loadingMore || isLastPage || loading) return;
    try {
      setLoadingMore(true);
      const data = await getFollowedPublicationsApi(page + 1, 10);
      setPublications((prev) => [...prev, ...(data?.content || [])]);
      setPage(data?.pageNumber || page + 1);
      setIsLastPage(data?.last ?? true);
    } catch (err) {
      console.warn("Error cargando más seguidas:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Si la publicación tenía novedades, la marca como vista y apaga el badge localmente
  const markAsSeen = async (publication) => {
    if (!publication.hasNewUpdates) return;
    try {
      await markPublicationAsSeenApi(publication.id);
    } catch (err) {
      console.warn("Error marcando publicación como vista:", err);
    }
    setPublications((prev) =>
      prev.map((item) =>
        item.id === publication.id ? { ...item, hasNewUpdates: false } : item,
      ),
    );
  };

  return {
    publications,
    loading,
    loadingMore,
    error,
    loadFirstPage,
    loadMore,
    markAsSeen,
  };
}
