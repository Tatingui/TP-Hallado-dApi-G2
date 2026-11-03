import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Q } from "@nozbe/watermelondb";
import { database } from "../database";
import { getDatabaseSession, isCurrentSession } from "../database/session";
import { useAuth } from "./useAuth";
import { useNetworkStatus } from "./useNetworkStatus";
import {
  deletePublicationApi,
  getMyPublicationsApi,
  renewPublicationApi,
} from "../services/publicationService";
import { getPendingPublications } from "../storage/pendingSyncStorage";
import { triggerSyncProcess } from "../sync/syncCoordinator";
import { PENDING_SUBMISSION_STATUS } from "../constants/publicationConstants";

export default function useMyPublications() {
  const { token } = useAuth();
  const { isConnected } = useNetworkStatus();
  const [publications, setPublications] = useState([]);
  const [pendingPublications, setPendingPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPublications = useCallback(
    async (pageNum = 0, append = false) => {
      try {
        const pending = await getPendingPublications();
        setPendingPublications(pending || []);

        if (pending && pending.length > 0) {
          await triggerSyncProcess();
          const updatedPending = await getPendingPublications();
          setPendingPublications(updatedPending || []);
        }

        const data = await getMyPublicationsApi(pageNum, 10, statusFilter);
        const items = data.content || [];
        setPublications((previous) => append ? [...previous, ...items] : items);
        setIsLastPage(data.last ?? true);
        setPage(pageNum);
      } catch (error) {
        console.warn("Error cargando mis publicaciones o modo offline:", error);
        if (!append) setPublications([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [statusFilter],
  );

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPublications(0);
    }, [fetchPublications]),
  );

  useEffect(() => {
    const session = getDatabaseSession();
    let previousCount = null;
    const subscription = database
      .get("pending_operations")
      .query(Q.where("owner", session.owner))
      .observeWithColumns(["state", "last_error"])
      .subscribe(async (rows) => {
        if (!isCurrentSession(session)) return;
        try {
          const pending = await getPendingPublications();
          if (!isCurrentSession(session)) return;
          setPendingPublications(pending);
          if (previousCount !== null && rows.length < previousCount) {
            const data = await getMyPublicationsApi(0, 10, statusFilter);
            if (isCurrentSession(session)) {
              setPublications(data.content || []);
              setPage(0);
              setIsLastPage(data.last ?? true);
            }
          }
          previousCount = rows.length;
        } catch {
          // A manual refresh remains available if the backend is offline.
        }
      });
    return () => subscription.unsubscribe();
  }, [token, statusFilter]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    return fetchPublications(0);
  }, [fetchPublications]);

  const loadMore = useCallback(() => {
    if (isLastPage || loadingMore) return;
    setLoadingMore(true);
    return fetchPublications(page + 1, true);
  }, [fetchPublications, isLastPage, loadingMore, page]);

  const deletePublication = useCallback(async (id) => {
    await deletePublicationApi(id);
    await fetchPublications(0);
  }, [fetchPublications]);

  const renewPublication = useCallback(async (id) => {
    if (!isConnected) {
      throw new Error("Necesitás conexión a internet para renovar una publicación.");
    }
    await renewPublicationApi(id);
    await fetchPublications(0);
  }, [fetchPublications, isConnected]);

  const formattedPendingList = pendingPublications.map((pending) => ({
    id: pending.offlineId,
    title: pending.payload?.title || "Sin título",
    category: pending.payload?.category,
    barrio: pending.payload?.barrio,
    type: pending.payload?.type,
    status: PENDING_SUBMISSION_STATUS,
    createdAt: pending.createdAt,
    isPending: true,
    lastError: pending.lastError,
    pendingState: pending.status,
    pendingDraft: { ...pending.payload, images: pending.images },
  }));

  return {
    publications,
    pendingPublications,
    combinedPublications: [...formattedPendingList, ...publications],
    loading,
    refreshing,
    statusFilter,
    setStatusFilter,
    isLastPage,
    loadingMore,
    isConnected,
    refresh,
    loadMore,
    deletePublication,
    renewPublication,
  };
}
