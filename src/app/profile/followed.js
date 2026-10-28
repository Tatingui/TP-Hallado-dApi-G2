import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PublicationCard from "../../components/PublicationCard";
import { Colors } from "../../constants/theme";
import { getStatusLabel } from "../../constants/publicationConstants";
import {
  getFollowedPublicationsApi,
  markPublicationAsSeenApi,
} from "../../services/publicationService";

/**
 * Punto 9: Sección "Seguidas" con todas las publicaciones que la persona sigue.
 * Las que cambiaron de estado desde la última vez que se vieron se marcan con "Novedad".
 */
export default function FollowedPublicationsScreen() {
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

  const handleLoadMore = async () => {
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

  const handleOpen = async (publication) => {
    if (publication.hasNewUpdates) {
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
    }
    router.push(`/publication/${publication.id}`);
  };

  const renderPublication = ({ item }) => (
    <View>
      <View style={styles.statusRow}>
        <Text style={styles.statusText}>Estado: {getStatusLabel(item.status)}</Text>
        {item.hasNewUpdates && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>Novedad: cambió de estado</Text>
          </View>
        )}
      </View>
      <PublicationCard publication={item} onPress={() => handleOpen(item)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Seguidas</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={56} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadFirstPage}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={publications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPublication}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="bookmark-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Todavía no seguís ninguna publicación</Text>
              <Text style={styles.emptySubtitle}>
                Desde el detalle de una publicación podés seguirla para enterarte cuando cambie de estado.
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={{ marginVertical: 16 }} color={Colors.primary} />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "800",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 8,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  newBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
  },
});
