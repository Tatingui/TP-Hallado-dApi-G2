import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CreateClaimModal from "../../components/CreateClaimModal";
import {
  getCategoryLabel,
  getStatusLabel,
  getTypeLabel,
  PublicationStatus,
  PublicationType,
} from "../../constants/publicationConstants";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { IMAGE_BASE_URL } from "../../services/api";
import { createClaimApi } from "../../services/claimService";
import {
  followPublicationApi,
  getPublicationByIdApi,
  getPublicationFollowStatusApi,
  markPublicationAsSeenApi,
  unfollowPublicationApi,
} from "../../services/publicationService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PublicationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();

  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  // States for Claim Modal
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  useEffect(() => {
    if (id) {
      loadPublication(id);
    }
  }, [id]);

  useEffect(() => {
    if (publication?.id) {
      loadFollowState(publication.id);
    }
  }, [publication?.id, user]);

  const loadPublication = async (pubId) => {
    try {
      setLoading(true);
      const data = await getPublicationByIdApi(pubId);
      setPublication(data);
    } catch (err) {
      console.warn("Error cargando publicación:", err);
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
        try {
          await markPublicationAsSeenApi(pubId);
        } catch (error) {
          console.warn("No se pudo marcar como vista la publicación:", error);
        }
      }
    } catch (error) {
      console.warn("Error cargando estado de seguimiento:", error);
      setIsFollowing(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!user || !isAuthenticated) {
      Alert.alert("Iniciá sesión", "Necesitás iniciar sesión para seguir esta publicación.");
      return;
    }

    try {
      setIsUpdatingFollow(true);
      const nextState = isFollowing ? await unfollowPublicationApi(publication.id) : await followPublicationApi(publication.id);
      setIsFollowing(Boolean(nextState?.followed));

      Alert.alert(
        Boolean(nextState?.followed) ? "Publicación seguida" : "Seguimiento cancelado",
        Boolean(nextState?.followed)
          ? "Te avisaremos cuando haya novedades de esta publicación."
          : "Ya no recibís novedades de esta publicación."
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo actualizar el seguimiento de la publicación.");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const handleSubmitClaim = async (claimData) => {
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
      console.error(err);
      Alert.alert("Error", err.message || "No se pudo enviar el reclamo. Recordá el límite de 3 intentos.");
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case PublicationStatus.OPEN:
        return Colors.primary;
      case PublicationStatus.IN_CLAIM:
        return "#f59e0b";
      case PublicationStatus.RESOLVED:
        return Colors.success || "#22c55e";
      case PublicationStatus.EXPIRED:
        return Colors.textSecondary;
      default:
        return Colors.text;
    }
  };

  const buildImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${IMAGE_BASE_URL}${url}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!publication) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.border} />
        <Text style={styles.errorText}>No se pudo cargar la publicación</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
          <Text style={styles.retryBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = publication.imageUrls || [];
  const hasImages = images.length > 0;

  const normalizedUserEmail = typeof user === "string" ? user.toLowerCase() : "";
  const isMyPublication =
    publication.publisher?.email?.toLowerCase() === normalizedUserEmail ||
    publication.publisher?.nombre === user;
  const isFound = publication.type === PublicationType.FOUND;
  const isLost = publication.type === PublicationType.LOST;
  const canInteract = !isMyPublication && publication.status === PublicationStatus.OPEN;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Detalle
        </Text>
        <TouchableOpacity
          style={[styles.followButton, isFollowing && styles.followButtonActive]}
          onPress={handleToggleFollow}
          disabled={isUpdatingFollow}
        >
          <Ionicons
            name={isFollowing ? "bookmark" : "bookmark-outline"}
            size={18}
            color={isFollowing ? Colors.surface : Colors.primary}
          />
          <Text style={[styles.followButtonText, isFollowing && styles.followButtonTextActive]}>
            {isFollowing ? "Siguiendo" : "Seguir"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {hasImages && (
          <View style={styles.imageCarousel}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setActiveImage(idx);
              }}
            >
              {images.map((url, i) => (
                <Image
                  key={i}
                  source={{ uri: buildImageUrl(url) }}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            {images.length > 1 && (
              <View style={styles.dotsContainer}>
                {images.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === activeImage && styles.dotActive]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.badgeRow}>
          <View style={[styles.typeBadge, {
            backgroundColor: isLost ? "#ef4444" : Colors.primary
          }]}>
            <Ionicons
              name={isLost ? "search-outline" : "eye-outline"}
              size={14}
              color={Colors.surface}
            />
            <Text style={styles.badgeText}>{getTypeLabel(publication.type)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(publication.status) }]}>
            <Text style={styles.badgeText}>{getStatusLabel(publication.status)}</Text>
          </View>
        </View>

        <Text style={styles.title}>{publication.title}</Text>
        {publication.description ? (
          <Text style={styles.description}>{publication.description}</Text>
        ) : null}

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="folder-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Categoría</Text>
            <Text style={styles.infoValue}>{getCategoryLabel(publication.category)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Barrio</Text>
            <Text style={styles.infoValue}>{publication.barrio}</Text>
          </View>

          {/* Ocultar dirección exacta hasta reclamo (Punto 4) */}
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="navigate-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Dirección</Text>
            {isMyPublication ? (
               <Text style={styles.infoValue}>{publication.address || "No especificada"}</Text>
            ) : (
               <Text style={[styles.infoValue, { fontStyle: "italic", color: "#9CA3AF" }]}>
                 🔒 Oculta hasta aceptar reclamo
               </Text>
            )}
          </View>

          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Fecha</Text>
            <Text style={styles.infoValue}>
              {publication.eventDate
                ? new Date(publication.eventDate).toLocaleDateString("es-AR")
                : "Sin fecha"}
            </Text>
          </View>
        </View>

        {publication.publisher && (
          <TouchableOpacity
            style={styles.publisherCard}
            activeOpacity={0.7}
            onPress={() => router.push(`/profile/public/${publication.publisher.id}`)}
          >
            <View style={styles.publisherAvatar}>
              {publication.publisher.profileImageUrl ? (
                <Image
                  source={{ uri: buildImageUrl(publication.publisher.profileImageUrl) }}
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons name="person-circle-outline" size={48} color={Colors.textSecondary} />
              )}
            </View>
            <View style={styles.publisherInfo}>
              <Text style={styles.publisherName}>{publication.publisher.nombre}</Text>
              <View style={styles.publisherStats}>
                <Text style={styles.statText}>
                  {publication.publisher.devolucionesConcretadas} devoluciones
                </Text>
                <Text style={styles.statDot}>·</Text>
                <Ionicons name="thumbs-up-outline" size={12} color={Colors.success || "#22c55e"} />
                <Text style={[styles.statText, { color: Colors.success || "#22c55e" }]}>
                  {publication.publisher.valoracionesPositivas}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Footer Dinámico con Botones de Reclamo */}
      {canInteract && (
        <View style={[styles.actionFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[styles.mainActionBtn, { backgroundColor: isFound ? Colors.primary : "#10B981" }]}
            onPress={() => setClaimModalVisible(true)}
          >
            <MaterialCommunityIcons
              name={isFound ? "hand-heart" : "hand-back-right"}
              size={20}
              color="#FFF"
            />
            <Text style={styles.mainActionText}>
              {isFound ? "¡Es mío!" : "¡Lo encontré!"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isMyPublication && publication.status === PublicationStatus.OPEN && (
        <View style={[styles.actionFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[styles.mainActionBtn, { backgroundColor: "#374151" }]}
            onPress={() => router.push(`/publication/edit/${publication.id}`)}
          >
            <Ionicons name="settings-outline" size={20} color="#FFF" />
            <Text style={styles.mainActionText}>Gestionar Publicación</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal Reclamo */}
      <CreateClaimModal
        visible={claimModalVisible}
        onClose={() => setClaimModalVisible(false)}
        onSubmit={handleSubmitClaim}
        publicationType={publication.type}
        verificationQuestion={publication.verificationQuestion}
        isSubmitting={isSubmittingClaim}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background },
  errorText: { fontSize: 16, color: Colors.textSecondary, marginTop: 12 },
  retryBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: Colors.primary, borderRadius: 8 },
  retryBtnText: { color: Colors.surface, fontWeight: "600" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "600", color: Colors.text },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 999,
    backgroundColor: Colors.surface,
  },
  followButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
  followButtonTextActive: {
    color: Colors.surface,
  },

  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  // Image carousel
  imageCarousel: { position: "relative" },
  carouselImage: { width: SCREEN_WIDTH, height: 260 },
  dotsContainer: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.5)" },
  dotActive: { backgroundColor: "#fff" },

  // Badges
  badgeRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, paddingTop: 16 },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "600", color: Colors.surface },

  // Title & description
  title: { fontSize: 22, fontWeight: "700", color: Colors.text, paddingHorizontal: 20, paddingTop: 12 },
  description: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, paddingHorizontal: 20, paddingTop: 8 },

  // Info card
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  infoLabel: { fontSize: 14, color: Colors.textSecondary, marginLeft: 8, width: 80 },
  infoValue: { fontSize: 14, color: Colors.text, fontWeight: "500", flex: 1 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },

  // Publisher card
  publisherCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  publisherAvatar: { marginRight: 12 },
  avatarImage: { width: 48, height: 48, borderRadius: 24 },
  publisherInfo: { flex: 1 },
  publisherName: { fontSize: 15, fontWeight: "600", color: Colors.text },
  publisherStats: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  statText: { fontSize: 12, color: Colors.textSecondary },
  statDot: { color: Colors.textSecondary },

  // Distance
  distanceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  distanceText: { fontSize: 14, color: Colors.text },
  actionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  mainActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  mainActionText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  }
});
