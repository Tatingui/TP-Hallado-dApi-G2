import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
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
import useAlertResults from "../../hooks/useAlertResults";

/**
 * Punto 9: Publicaciones que coinciden con una alerta.
 * Las nuevas (desde la última vez que se abrió) se marcan con "Nueva".
 */
export default function AlertResultsScreen() {
  const navigation = useNavigation();
  const { id, summary } = useRoute().params ?? {};
  const { publications, loading, loadingMore, error, loadFirstPage, loadMore } =
    useAlertResults(id);

  const renderPublication = ({ item }) => (
    <View>
      {item.hasNewUpdates && (
        <View style={styles.newBadge}>
          <Ionicons name="sparkles" size={12} color="#fff" />
          <Text style={styles.newBadgeText}>Nueva</Text>
        </View>
      )}
      <PublicationCard
        publication={item}
        onPress={() => navigation.navigate("PublicationDetail", { id: String(item.id) })}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Resultados de la alerta</Text>
          {summary ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {summary}
            </Text>
          ) : null}
        </View>
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
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="search-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Todavía no hay publicaciones que coincidan</Text>
              <Text style={styles.emptySubtitle}>
                Cuando alguien publique algo que coincida, lo vas a ver acá y en "Mis alertas".
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
    backgroundColor: Colors.gray50,
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
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 2,
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
  newBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 6,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.gray700,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.gray500,
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
