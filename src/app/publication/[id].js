import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { IMAGE_BASE_URL } from "../../services/api";
import { getPublicationByIdApi } from "../../services/publicationService";
import {
  getTypeLabel,
  getCategoryLabel,
  getStatusLabel,
  PublicationStatus,
  PublicationType,
} from "../../constants/publicationConstants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PublicationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (id) {
      loadPublication(id);
    }
  }, [id]);

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

  /**
   * Construye la URL completa de una imagen.
   * Si la URL ya es absoluta (http/https) la usa directo,
   * si no, le agrega la base del servidor.
   */
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

  return (
    <View style={styles.container}>
      {/* Header con botón atrás */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Detalle
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Carrusel de imágenes */}
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

        {/* Badges de tipo y estado */}
        <View style={styles.badgeRow}>
          <View style={[styles.typeBadge, {
            backgroundColor: publication.type === PublicationType.LOST ? "#ef4444" : Colors.primary
          }]}>
            <Ionicons
              name={publication.type === PublicationType.LOST ? "search-outline" : "eye-outline"}
              size={14}
              color={Colors.surface}
            />
            <Text style={styles.badgeText}>{getTypeLabel(publication.type)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(publication.status) }]}>
            <Text style={styles.badgeText}>{getStatusLabel(publication.status)}</Text>
          </View>
        </View>

        {/* Título y descripción */}
        <Text style={styles.title}>{publication.title}</Text>
        {publication.description ? (
          <Text style={styles.description}>{publication.description}</Text>
        ) : null}

        {/* Info card */}
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

          {publication.address ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Ionicons name="navigate-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.infoLabel}>Dirección</Text>
                <Text style={styles.infoValue}>{publication.address}</Text>
              </View>
            </>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Fecha</Text>
            <Text style={styles.infoValue}>
              {publication.eventDate
                ? new Date(publication.eventDate).toLocaleDateString("es-AR")
                : publication.createdAt
                  ? new Date(publication.createdAt).toLocaleDateString("es-AR")
                  : "Sin fecha"}
            </Text>
          </View>

          {publication.expiresAt ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.infoLabel}>Vence</Text>
                <Text style={styles.infoValue}>
                  {new Date(publication.expiresAt).toLocaleDateString("es-AR")}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Publicador */}
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

        {/* Distancia si está disponible */}
        {publication.distanceKm != null && (
          <View style={styles.distanceCard}>
            <Ionicons name="map-outline" size={20} color={Colors.primary} />
            <Text style={styles.distanceText}>
              A {publication.distanceKm} km de tu ubicación
            </Text>
          </View>
        )}
      </ScrollView>
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
});
