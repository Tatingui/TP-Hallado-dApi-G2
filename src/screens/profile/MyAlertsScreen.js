import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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
import AlertCard from "../../components/alerts/AlertCard";
import { Colors } from "../../constants/theme";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import useAlerts from "../../hooks/useAlerts";

/**
 * Punto 9: Mis alertas. Permite verlas, pausarlas, reanudarlas o eliminarlas,
 * con la cantidad de publicaciones nuevas que coinciden con cada una.
 */
export default function MyAlertsScreen() {
  const navigation = useNavigation();
  const { isConnected } = useNetworkStatus();
  const {
    alerts,
    loading,
    refreshing,
    processingId,
    refresh,
    toggleActive,
    deleteAlert,
    getAlertSummary,
  } = useAlerts();

  const requireConnection = () => {
    if (!isConnected) {
      Alert.alert("Sin conexión", "Necesitás conexión a internet para modificar tus alertas.");
      return false;
    }
    return true;
  };

  const handleToggleActive = (alert) => {
    if (!requireConnection()) return;
    toggleActive(alert);
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
          onPress: () => deleteAlert(alert),
        },
      ],
    );
  };

  const handleOpenAlert = (alert) => {
    navigation.navigate("AlertResults", { id: String(alert.id), summary: getAlertSummary(alert) });
  };

  const renderAlert = ({ item }) => (
    <AlertCard
      alert={item}
      summary={getAlertSummary(item)}
      isConnected={isConnected}
      isProcessing={processingId === item.id}
      onPress={() => handleOpenAlert(item)}
      onToggleActive={() => handleToggleActive(item)}
      onDelete={() => handleDelete(item)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
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
            <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[Colors.primary]} />
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
