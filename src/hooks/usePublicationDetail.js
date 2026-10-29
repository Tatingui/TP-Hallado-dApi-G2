import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "./useAuth";
import { createClaimApi } from "../services/claimService";
import {
  followPublicationApi,
  getPublicationByIdApi,
  getPublicationFollowStatusApi,
  markPublicationAsSeenApi,
  unfollowPublicationApi,
} from "../services/publicationService";
import {
  savePublicationDetailOffline,
  getOfflinePublicationDetail,
} from "../storage/offlinePublicationsStorage";
import { PublicationStatus, PublicationType } from "../constants/publicationConstants";

/**
 * Hook que encapsula toda la lógica del detalle de una publicación:
 * carga, follow/unfollow, reclamos y derivaciones.
 */
export default function usePublicationDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  useEffect(() => {
    if (id) loadPublication(id);
  }, [id]);

  useEffect(() => {
    if (publication?.id && !isOfflineMode) loadFollowState(publication.id);
  }, [publication?.id, user, isOfflineMode]);

  const loadPublication = async (pubId) => {
    try {
      setLoading(true);
      setIsOfflineMode(false);
      const data = await getPublicationByIdApi(pubId);
      setPublication(data);
      await savePublicationDetailOffline(data);
    } catch (err) {
      console.warn("Error o falta de red al cargar publicación, buscando copia local...", err);
      const cached = await getOfflinePublicationDetail(pubId);
      if (cached) {
        setPublication(cached);
        setIsOfflineMode(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFollowState = async (pubId) => {
    if (!user || !isAuthenticated) {
      setIsFollowing(false);
      return;
    }
    try {
      const followStatus = await getPublicationFollowStatusApi(pubId);
      const followed = Boolean(followStatus?.followed);
      setIsFollowing(followed);
      if (followed) {
        try { await markPublicationAsSeenApi(pubId); } catch { /* silencioso */ }
      }
    } catch {
      setIsFollowing(false);
    }
  };

  const handleToggleFollow = async () => {
    if (isOfflineMode) {
      Alert.alert("Sin conexión", "Se requiere conexión a internet para seguir publicaciones.");
      return;
    }
    if (!user || !isAuthenticated) {
      Alert.alert("Iniciá sesión", "Necesitás iniciar sesión para seguir esta publicación.");
      return;
    }
    try {
      setIsUpdatingFollow(true);
      const nextState = isFollowing
        ? await unfollowPublicationApi(publication.id)
        : await followPublicationApi(publication.id);
      setIsFollowing(Boolean(nextState?.followed));
      Alert.alert(
        Boolean(nextState?.followed) ? "Publicación seguida" : "Seguimiento cancelado",
        Boolean(nextState?.followed)
          ? "Te avisaremos cuando haya novedades de esta publicación."
          : "Ya no recibís novedades de esta publicación."
      );
    } catch {
      Alert.alert("Error", "No se pudo actualizar el seguimiento de la publicación.");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const handlePressClaim = () => {
    if (isOfflineMode) {
      Alert.alert("Sin conexión", "Se requiere conexión a internet para realizar un reclamo.");
      return;
    }
    setClaimModalVisible(true);
  };

  const handlePressEdit = () => {
    if (isOfflineMode) {
      Alert.alert("Sin conexión", "Se requiere conexión a internet para editar publicaciones.");
      return;
    }
    router.push(`/publication/edit/${publication.id}`);
  };

  const handleSubmitClaim = async (claimData) => {
    if (isOfflineMode) {
      Alert.alert("Sin conexión", "Se requiere conexión a internet para enviar reclamos.");
      return;
    }
    try {
      setIsSubmittingClaim(true);
      await createClaimApi(
        publication.id,
        claimData.proofMessage,
        claimData.verificationAnswer,
        claimData.imageUri
      );
      setClaimModalVisible(false);
      Alert.alert(
        "Reclamo enviado",
        "Tu reclamo fue enviado exitosamente al publicador. Podés seguir el estado desde 'Mis Reclamos'.",
        [{ text: "Entendido", onPress: () => router.push("/(tabs)/claims") }]
      );
    } catch (err) {
      Alert.alert("Error", err.message || "No se pudo enviar el reclamo. Recordá el límite de 3 intentos.");
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  // Derivaciones
  const normalizedUserEmail = typeof user === "string" ? user.toLowerCase() : "";
  const isMyPublication =
    publication?.publisher?.email?.toLowerCase() === normalizedUserEmail ||
    publication?.publisher?.nombre === user;
  const isFound = publication?.type === PublicationType.FOUND;
  const isLost = publication?.type === PublicationType.LOST;
  const canInteract = !isMyPublication && publication?.status === PublicationStatus.OPEN;
  const images = publication?.imageUrls || publication?.images || [];

  return {
    id,
    router,
    publication,
    loading,
    images,
    activeImage,
    setActiveImage,
    isFollowing,
    isUpdatingFollow,
    isOfflineMode,
    claimModalVisible,
    setClaimModalVisible,
    isSubmittingClaim,
    isMyPublication,
    isFound,
    isLost,
    canInteract,
    handleToggleFollow,
    handlePressClaim,
    handlePressEdit,
    handleSubmitClaim,
  };
}
