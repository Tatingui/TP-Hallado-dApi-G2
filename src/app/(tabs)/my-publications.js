import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { getMyPublicationsApi } from "../../services/publicationService";
import {
  PublicationStatus,
  getStatusLabel,
  getTypeLabel,
  getCategoryLabel,
  getCategoryIcon,
} from "../../constants/publicationConstants";

const STATUS_FILTERS = [
  { id: null, label: "Todas" },
  { id: PublicationStatus.OPEN, label: "Abiertas" },
  { id: PublicationStatus.IN_CLAIM, label: "En Reclamo" },
  { id: PublicationStatus.RESOLVED, label: "Resueltas" },
  { id: PublicationStatus.EXPIRED, label: "Vencidas" },
];

export default function MyPublicationsScreen() {
  const { token } = useAuth();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPublications = useCallback(
    async (pageNum = 0, append = false) => {
      try {
        const data = await getMyPublicationsApi(pageNum, 10, statusFilter);
        const items = data.content || [];
        setPublications(append ? (prev) => [...prev, ...items] : items);
        setIsLastPage(data.last ?? true);
        setPage(pageNum);
      } catch (err) {
        console.warn("Error cargando mis publicaciones:", err);
        if (!append) setPublications([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [statusFilter]
  );

  // Recargar al enfocar la tab o cambiar filtro
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPublications(0);
    }, [fetchPublications])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPublications(0);
  };

  const loadMore = () => {
    if (isLastPage || loadingMore) return;
    setLoadingMore(true);
    fetchPublications(page + 1, true);
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

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
        <Text style={styles.typeText}>{getTypeLabel(item.type)}</Text>
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="folder-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{getCategoryLabel(item.category)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{item.barrio}</Text>
        </View>
      </View>

      {item.createdAt && (
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString("es-AR")}
        </Text>
      )}
    </TouchableOpacity>
  );

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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={publications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={publications.length === 0 ? { flex: 1 } : { padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
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

  // Cards
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: "600", color: Colors.surface },
  typeText: { fontSize: 12, color: Colors.textSecondary },
  cardTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, marginBottom: 8 },
  cardMeta: { flexDirection: "row", gap: 16, marginBottom: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 13, color: Colors.textSecondary },
  dateText: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },

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
