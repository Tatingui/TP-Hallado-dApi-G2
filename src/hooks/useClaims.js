import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './useAuth';
import { checkNetworkConnection, useNetworkStatus } from './useNetworkStatus';
import {
  getMySentClaimsApi,
  getMyReceivedClaimsApi,
  respondToClaimApi,
  proposeMeetingPointApi,
  acceptMeetingPointApi
} from '../services/claimService';
import { ClaimStatus } from '../constants/publicationConstants';

/**
 * Hook que encapsula la lógica de "Mis Reclamos": carga paginada de enviados/recibidos,
 * respuesta a reclamos (con confirmación), punto de encuentro y modo sin conexión.
 * Recibe la pestaña activa ('SENT' | 'RECEIVED') y vuelve a cargar cuando cambia.
 */
export default function useClaims(activeTab) {
  const { token } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [cachedOffline, setIsOfflineMode] = useState(false);
  const { isConnected } = useNetworkStatus();
  const isOfflineMode = cachedOffline || !isConnected;

  // Punto 8: reclamo sobre el que se está proponiendo un punto de encuentro
  const [meetingClaim, setMeetingClaim] = useState(null);
  const [isSubmittingMeeting, setIsSubmittingMeeting] = useState(false);

  useEffect(() => {
    fetchClaims(0, true);
  }, [activeTab]);

  const fetchClaims = async (pageToFetch = 0, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);
    setIsOfflineMode(false);

    try {
      let response;
      if (activeTab === 'SENT') {
        response = await getMySentClaimsApi(pageToFetch, 10, token);
      } else {
        response = await getMyReceivedClaimsApi(pageToFetch, 10, token);
      }

      setIsOfflineMode(Boolean(response.__offline));
      const newContent = response.content || [];
      if (pageToFetch === 0) {
        setClaims(newContent);
      } else {
        setClaims(prev => [...prev, ...newContent]);
      }

      setPage(response.pageNumber || 0);
      setIsLastPage(response.last ?? true);
    } catch (err) {
      console.error("Error loading claims", err);
      setIsOfflineMode(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchClaims(0, false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && !isLastPage && !loading && !isOfflineMode) {
      fetchClaims(page + 1, false);
    }
  };

  const handleRespond = async (claimId, newStatus) => {
    const isOnline = await checkNetworkConnection();
    if (!isOnline || isOfflineMode) {
      Alert.alert("Sin conexión", "Se requiere conexión a internet para aceptar o rechazar reclamos.");
      return;
    }

    const actionText = newStatus === ClaimStatus.ACCEPTED ? 'aceptar' : 'rechazar';

    Alert.alert(
      "Confirmar acción",
      `¿Estás seguro de que querés ${actionText} este reclamo? ${newStatus === ClaimStatus.ACCEPTED ? 'Los demás reclamos pendientes para esta publicación serán rechazados automáticamente.' : ''}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: newStatus === ClaimStatus.ACCEPTED ? "default" : "destructive",
          onPress: async () => {
            try {
              setProcessingId(claimId);
              await respondToClaimApi(claimId, newStatus, token);
              fetchClaims(0, true);
            } catch (err) {
              Alert.alert("Error", err.message || "No se pudo actualizar el estado del reclamo.");
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };

  const handleSubmitMeeting = async (address) => {
    if (!(await checkNetworkConnection())) { Alert.alert("Sin conexión", "Necesitás conexión para acordar el encuentro."); return; }
    try {
      setIsSubmittingMeeting(true);
      await proposeMeetingPointApi(meetingClaim.id, address, token);
      setMeetingClaim(null);
      Alert.alert("Propuesta enviada", "La otra parte puede aceptarla o sugerir otro lugar.");
      fetchClaims(0, true);
    } catch (err) {
      Alert.alert("Error", err.message || "No se pudo enviar la propuesta.");
    } finally {
      setIsSubmittingMeeting(false);
    }
  };

  const handleAcceptMeeting = (claimId) => {
    Alert.alert(
      "Confirmar punto de encuentro",
      "¿Aceptás este lugar? Una vez confirmado no se puede cambiar.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aceptar",
          onPress: async () => {
            try {
              setProcessingId(claimId);
              await acceptMeetingPointApi(claimId, token);
              fetchClaims(0, true);
            } catch (err) {
              Alert.alert("Error", err.message || "No se pudo aceptar el punto de encuentro.");
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };

  return {
    claims,
    loading,
    refreshing,
    loadingMore,
    isOfflineMode,
    processingId,
    meetingClaim,
    setMeetingClaim,
    isSubmittingMeeting,
    handleRefresh,
    handleLoadMore,
    handleRespond,
    handleSubmitMeeting,
    handleAcceptMeeting,
  };
}
