import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CreateClaimModal from "../../components/CreateClaimModal";
import OfflineBanner from "../../components/OfflineBanner";
import ImageGallery from "../../components/publication/ImageGallery";
import PublisherCard from "../../components/publication/PublisherCard";
import {
  getCategoryLabel,
  getStatusLabel,
  getTypeLabel,
  getPublicationStatusColor,
  PublicationStatus,
} from "../../constants/publicationConstants";
import { Colors } from "../../constants/theme";
import usePublicationDetail from "../../hooks/usePublicationDetail";

export default function PublicationDetailScreen() {
  const insets = useSafeAreaInsets();
  const {
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
  } = usePublicationDetail();

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Detalle</Text>
        <TouchableOpacity
          style={[styles.followButton, isFollowing && styles.followButtonActive, isOfflineMode && styles.disabledButton]}
          onPress={handleToggleFollow}
          disabled={isUpdatingFollow}
        >
          <Ionicons
            name={isFollowing ? "bookmark" : "bookmark-outline"}
            size={18}
            color={isFollowing ? Colors.surface : (isOfflineMode ? Colors.disabled : Colors.primary)}
          />
          <Text style={[styles.followButtonText, isFollowing && styles.followButtonTextActive, isOfflineMode && { color: Colors.disabled }]}>
            {isFollowing ? "Siguiendo" : "Seguir"}
          </Text>
        </TouchableOpacity>
      </View>

      {isOfflineMode && (
        <OfflineBanner message="Modo Sin Conexión: Viendo copia guardada localmente" />
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Galería de imágenes */}
        <ImageGallery images={images} activeImage={activeImage} onImageChange={setActiveImage} />

        {/* Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: isLost ? Colors.error : Colors.primary }]}>
            <Ionicons name={isLost ? "search-outline" : "eye-outline"} size={14} color={Colors.surface} />
            <Text style={styles.badgeText}>{getTypeLabel(publication.type)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getPublicationStatusColor(publication.status) }]}>
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
          <InfoRow icon="folder-outline" label="Categoría" value={getCategoryLabel(publication.category)} />
          <View style={styles.divider} />
          <InfoRow icon="location-outline" label="Barrio" value={publication.barrio} />
          <View style={styles.divider} />
          <InfoRow
            icon="navigate-outline"
            label="Dirección"
            value={isMyPublication ? (publication.address || "No especificada") : null}
            placeholder="🔒 Oculta hasta aceptar reclamo"
          />
          <View style={styles.divider} />
          <InfoRow
            icon="calendar-outline"
            label="Fecha"
            value={publication.eventDate ? new Date(publication.eventDate).toLocaleDateString("es-AR") : "Sin fecha"}
          />
        </View>

        {/* Publicador */}
        <PublisherCard publisher={publication.publisher} isOfflineMode={isOfflineMode} />
      </ScrollView>

      {/* Footer: botones de reclamo */}
      {canInteract && (
        <View style={[styles.actionFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[styles.mainActionBtn, { backgroundColor: isFound ? Colors.primary : Colors.success }, isOfflineMode && styles.disabledActionBtn]}
            onPress={handlePressClaim}
          >
            <MaterialCommunityIcons name={isFound ? "hand-heart" : "hand-back-right"} size={20} color={Colors.surface} />
            <Text style={styles.mainActionText}>{isFound ? "¡Es mío!" : "¡Lo encontré!"}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Footer: gestión propia */}
      {isMyPublication && (
        <View style={[styles.actionFooter, { paddingBottom: Math.max(insets.bottom, 16), gap: 10 }]}>
          {publication.status === PublicationStatus.OPEN && (
            <TouchableOpacity
              style={[styles.mainActionBtn, { backgroundColor: Colors.gray700, flex: 1 }, isOfflineMode && styles.disabledActionBtn]}
              onPress={handlePressEdit}
            >
              <Ionicons name="settings-outline" size={20} color={Colors.surface} />
              <Text style={styles.mainActionText}>Gestionar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.mainActionBtn, { backgroundColor: Colors.primary, flex: 1 }]}
            onPress={() => router.push({ pathname: "/(tabs)/claims", params: { tab: "received" } })}
          >
            <Ionicons name="mail-open-outline" size={20} color={Colors.surface} />
            <Text style={styles.mainActionText}>Ver reclamos</Text>
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

/** Mini-componente para las filas de info */
function InfoRow({ icon, label, value, placeholder }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={Colors.textSecondary} />
      <Text style={styles.infoLabel}>{label}</Text>
      {value ? (
        <Text style={styles.infoValue}>{value}</Text>
      ) : (
        <Text style={[styles.infoValue, { fontStyle: "italic", color: Colors.gray400 }]}>
          {placeholder || "—"}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background },
  errorText: { fontSize: 16, color: Colors.textSecondary, marginTop: 12 },
  retryBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: Colors.primary, borderRadius: 8 },
  retryBtnText: { color: Colors.surface, fontWeight: "600" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 48, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "600", color: Colors.text },
  followButton: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.primary, borderRadius: 999, backgroundColor: Colors.surface,
  },
  followButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  followButtonText: { fontSize: 12, fontWeight: "700", color: Colors.primary },
  followButtonTextActive: { color: Colors.surface },
  disabledButton: { borderColor: Colors.border, opacity: 0.6 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  badgeRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, paddingTop: 16 },
  typeBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "600", color: Colors.surface },
  title: { fontSize: 22, fontWeight: "700", color: Colors.text, paddingHorizontal: 20, paddingTop: 12 },
  description: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, paddingHorizontal: 20, paddingTop: 8 },
  infoCard: {
    backgroundColor: Colors.surface, borderRadius: 12, marginHorizontal: 20, marginTop: 16,
    padding: 16, borderWidth: 1, borderColor: Colors.border,
  },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  infoLabel: { fontSize: 14, color: Colors.textSecondary, marginLeft: 8, width: 80 },
  infoValue: { fontSize: 14, color: Colors.text, fontWeight: "500", flex: 1 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  actionFooter: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, paddingHorizontal: 20, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 10,
  },
  mainActionBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 14, borderRadius: 12, gap: 8,
  },
  disabledActionBtn: { opacity: 0.6 },
  mainActionText: { color: Colors.surface, fontSize: 16, fontWeight: "700" },
});
