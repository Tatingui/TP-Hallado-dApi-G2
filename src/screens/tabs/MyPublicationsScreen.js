import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { shared } from "../../constants/sharedStyles";
import useMyPublications from "../../hooks/useMyPublications";
import { PublicationStatusBadge } from "../../components/StatusBadge";
import {
  PENDING_SUBMISSION_STATUS,
  PublicationStatus,
  getStatusLabel,
  getTypeLabel,
  getCategoryLabel,
} from "../../constants/publicationConstants";
import { formatDate, parseDate } from "../../utils/date";

const STATUS_FILTERS = [
  { id: null, label: "Todas" },
  { id: PublicationStatus.OPEN, label: "Abiertas" },
  { id: PublicationStatus.IN_CLAIM, label: "En Reclamo" },
  { id: PublicationStatus.RESOLVED, label: "Resueltas" },
  { id: PublicationStatus.EXPIRED, label: "Vencidas" },
];

/**
 * Misma regla que el backend: vencida, o abierta con la vigencia ya cumplida
 * (la tarea programada todavía no la marcó como vencida).
 */
function isRenewable(publication) {
  if (publication.status === PublicationStatus.EXPIRED) return true;
  const expiresAt = parseDate(publication.expiresAt);
  return publication.status === PublicationStatus.OPEN && expiresAt !== null && expiresAt <= new Date();
}

export default function MyPublicationsScreen() {
  const navigation = useNavigation();
  const {
    pendingPublications,
    combinedPublications,
    loading,
    refreshing,
    statusFilter,
    setStatusFilter,
    loadingMore,
    isConnected,
    refresh,
    loadMore,
    deletePublication,
    renewPublication,
  } = useMyPublications();

  const handleDelete = (pub) => {
    Alert.alert(
      "Eliminar publicación",
      `¿Seguro que querés eliminar "${pub.title}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePublication(pub.id);
            } catch (err) {
              Alert.alert("Error", err?.message || "No se pudo eliminar la publicación.");
            }
          },
        },
      ]
    );
  };

  const handleRenew = (pub) => {
    if (!isConnected) {
      Alert.alert("Sin conexión", "Necesitás conexión a internet para renovar una publicación.");
      return;
    }
    Alert.alert(
      "Renovar publicación",
      `"${pub.title}" va a volver a estar visible por 30 días más.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Renovar",
          onPress: async () => {
            try {
              await renewPublication(pub.id);
            } catch (err) {
              Alert.alert("Error", err?.message || "No se pudo renovar la publicación.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    if (item.isPending) {
      return (
        <TouchableOpacity
          style={[shared.card, styles.pendingCard]}
          activeOpacity={0.8}
          onPress={() =>
            Alert.alert(
              "Publicación Pendiente",
              item.lastError || "Se enviará automáticamente cuando el dispositivo recupere conexión.",
              item.pendingState === "blocked" ? [{text: "Cerrar"}, {text: "Corregir", onPress: () => navigation.navigate("PublishTab", {pendingDraft: item.pendingDraft, pendingId: item.id})}] : [{text:"Entendido"}]
            )
          }
        >
          <View style={styles.cardHeader}>
            <PublicationStatusBadge status={PENDING_SUBMISSION_STATUS} label="Pendiente de envío ⏳" />
            <Text style={styles.typeText}>{getTypeLabel(item.type)}</Text>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={shared.metaRow}>
            <View style={shared.metaItem}>
              <Ionicons name="folder-outline" size={14} color={Colors.textSecondary} />
              <Text style={shared.metaText}>{getCategoryLabel(item.category)}</Text>
            </View>
            <View style={shared.metaItem}>
              <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
              <Text style={shared.metaText}>{item.barrio || "Sin barrio"}</Text>
            </View>
          </View>

          <Text style={styles.pendingHint}>{item.lastError || "Guardada localmente (esperando conexión)"}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={shared.card} activeOpacity={0.7} onPress={() => navigation.navigate("PublicationDetail", { id: String(item.id) })}>
        <View style={styles.cardHeader}>
          <PublicationStatusBadge status={item.status} />
          <Text style={styles.typeText}>{getTypeLabel(item.type)}</Text>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={shared.metaRow}>
          <View style={shared.metaItem}>
            <Ionicons name="folder-outline" size={14} color={Colors.textSecondary} />
            <Text style={shared.metaText}>{getCategoryLabel(item.category)}</Text>
          </View>
          <View style={shared.metaItem}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={shared.metaText}>{item.barrio}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View>
            {item.createdAt && (
              <Text style={styles.dateText}>Publicada el {formatDate(item.createdAt)}</Text>
            )}
            {(item.status === PublicationStatus.OPEN || item.status === PublicationStatus.EXPIRED) && item.expiresAt && (
              <Text style={styles.dateText}>
                {isRenewable(item) ? "Venció" : "Vence"} el {formatDate(item.expiresAt)}
              </Text>
            )}
          </View>
          {isRenewable(item) && (
            <TouchableOpacity
              style={styles.renewButton}
              onPress={(e) => { e.stopPropagation(); handleRenew(item); }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="refresh-outline" size={16} color={Colors.primary} />
              <Text style={styles.renewText}>Renovar</Text>
            </TouchableOpacity>
          )}
          {item.status === PublicationStatus.OPEN && !isRenewable(item) && (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation(); handleDelete(item); }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color={Colors.border} />
        <Text style={styles.emptyTitle}>No tenés publicaciones</Text>
        <Text style={styles.emptySubtitle}>
          {statusFilter
            ? `No hay publicaciones con estado "${getStatusLabel(statusFilter)}"`
            : "Creá tu primera publicación desde la pestaña Publicar"}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Publicaciones</Text>
      </View>

      {/* Filtros de estado */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id || "all"}
            style={[styles.filterChip, statusFilter === f.id && styles.filterChipActive]}
            onPress={() => setStatusFilter(f.id)}
          >
            <Text
              style={[styles.filterText, statusFilter === f.id && styles.filterTextActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {pendingPublications.length > 0 && (
        <View style={styles.pendingNotice}>
          <MaterialCommunityIcons name="cloud-upload-outline" size={18} color="#92400E" />
          <Text style={styles.pendingNoticeText}>
            Tenés {pendingPublications.length} publicación(es) pendiente(s) de envío
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={combinedPublications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={combinedPublications.length === 0 ? { flex: 1 } : { padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[Colors.primary]} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={{ paddingVertical: 16 }} color={Colors.primary} />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", color: Colors.text },

  // Filters
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: Colors.surface,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 12, color: Colors.text },
  filterTextActive: { color: Colors.surface, fontWeight: "600" },

  pendingNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#FDE68A",
  },
  pendingNoticeText: {
    fontSize: 13,
    color: "#92400E",
    fontWeight: "600",
  },

  // Cards
  pendingCard: {
    borderColor: Colors.warning,
    backgroundColor: "#FFFBEB",
    borderStyle: "dashed",
  },
  pendingHint: {
    fontSize: 12,
    color: "#D97706",
    fontStyle: "italic",
    marginTop: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  typeText: { fontSize: 12, color: Colors.textSecondary },
  cardTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, marginBottom: 8 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  renewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  renewText: { fontSize: 13, fontWeight: "600", color: Colors.primary },

  // Empty
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: Colors.text, marginTop: 16 },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  // Loading
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
});
