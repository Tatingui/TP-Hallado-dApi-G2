import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import OfflineBanner from "../../components/OfflineBanner";
import { Colors } from "../../constants/theme";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import {
  deleteAlertApi,
  getAlertSummary,
  getMyAlertsApi,
  setAlertActiveApi,
} from "../../services/alertService";

/**
 * Punto 9: Mis alertas. Permite verlas, pausarlas, reanudarlas o eliminarlas,
 * con la cantidad de publicaciones nuevas que coinciden con cada una.
 */
export default function MyAlertsScreen() {
  const { isConnected } = useNetworkStatus();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await getMyAlertsApi();
      setAlerts(data || []);
    } catch (err) {
      Alert.alert("Error", err?.message || "No se pudieron cargar tus alertas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Se recarga al volver de los resultados, para actualizar el contador de nuevas
  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [loadAlerts]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

  const requireConnection = () => {
    if (!isConnected) {
      Alert.alert("Sin conexión", "Necesitás conexión a internet para modificar tus alertas.");
      return false;
    }
    return true;
  };

  const handleToggleActive = async (alert) => {
    if (!requireConnection()) return;
    try {
      setProcessingId(alert.id);
      await setAlertActiveApi(alert.id, !alert.active);
      await loadAlerts();
    } catch (err) {
      Alert.alert("Error", err?.message || "No se pudo actualizar la alerta.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = (alert) => {
    if (!requireConnection()) return;
    Alert.alert(
      "Eliminar alerta",
      `¿Querés eliminar la alerta "${getAlertSummary(alert)}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessingId(alert.id);
              await deleteAlertApi(alert.id);
              setAlerts((prev) => prev.filter((item) => item.id !== alert.id));
            } catch (err) {
              Alert.alert("Error", err?.message || "No se pudo eliminar la alerta.");
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
    );
  };

  const handleOpenAlert = (alert) => {
    router.push({
      pathname: "/profile/alert/[id]",
      params: { id: alert.id, summary: getAlertSummary(alert) },
    });
  };

  const renderAlert = ({ item }) => {
    const isProcessing = processingId === item.id;
    const hasNews = item.active && item.newCount > 0;

    return (
      <Pressable
        style={[styles.card, !item.active && styles.cardPaused]}
        onPress={() => handleOpenAlert(item)}
      >
        <View style={styles.cardHeader}>
          <Ionicons
            name={item.active ? "notifications" : "notifications-off-outline"}
            size={20}
            color={item.active ? Colors.primary : Colors.textSecondary}
          />
          <Text style={styles.summary} numberOfLines={2}>
            {getAlertSummary(item)}
          </Text>
          {hasNews && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>
                {item.newCount === 1 ? "1 nueva" : `${item.newCount} nuevas`}
              </Text>
            </View>
          )}
          {!item.active && (
            <View style={styles.pausedBadge}>
              <Text style={styles.pausedBadgeText}>Pausada</Text>
            </View>
          )}
        </View>

        <Text style={styles.hint}>Tocá para ver las publicaciones que coinciden</Text>

        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, !isConnected && styles.actionDisabled]}
            onPress={() => handleToggleActive(item)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                <Ionicons name={item.active ? "pause" : "play"} size={16} color={Colors.primary} />
                <Text style={styles.actionText}>{item.active ? "Pausar" : "Reanudar"}</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.deleteButton, !isConnected && styles.actionDisabled]}
            onPress={() => handleDelete(item)}
            disabled={isProcessing}
          >
            <Ionicons name="trash-outline" size={16} color=Colors.error />
            <Text style={styles.deleteText}>Eliminar</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Mis alertas</Text>
      </View>

      {!isConnected && (
        <OfflineBanner message="Sin conexión: no podés pausar ni eliminar alertas hasta recuperar la conexión." />
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAlert}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="notifications-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No tenés alertas guardadas</Text>
              <Text style={styles.emptySubtitle}>
                Guardá una búsqueda desde el Buscador Guiado o desde Inicio con "Guardar alerta".
              </Text>
            </View>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gray200,
    padding: 14,
    marginBottom: 12,
  },
  cardPaused: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summary: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.gray900,
  },
  newBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  pausedBadge: {
    backgroundColor: Colors.gray200,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pausedBadgeText: {
    color: Colors.gray600,
    fontSize: 11,
    fontWeight: "700",
  },
  hint: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.purple200,
    backgroundColor: Colors.purple50,
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  deleteButton: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  deleteText: {
    color: Colors.error,
    fontWeight: "600",
    fontSize: 13,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gray700,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.gray500,
    textAlign: "center",
  },
});
