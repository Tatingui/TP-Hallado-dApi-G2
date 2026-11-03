import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  deleteAlertApi,
  getAlertSummary,
  getMyAlertsApi,
  setAlertActiveApi,
} from "../services/alertService";

/**
 * Hook que encapsula la lógica de "Mis alertas": carga (al enfocar la pantalla),
 * pull-to-refresh, pausar/reanudar y eliminar alertas, junto con el estado
 * de carga y la alerta que se está procesando.
 * También expone getAlertSummary para que la pantalla arme el texto de cada alerta
 * sin importar el servicio.
 */
export default function useAlerts() {
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

  const refresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

  const toggleActive = async (alert) => {
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

  const deleteAlert = async (alert) => {
    try {
      setProcessingId(alert.id);
      await deleteAlertApi(alert.id);
      setAlerts((prev) => prev.filter((item) => item.id !== alert.id));
    } catch (err) {
      Alert.alert("Error", err?.message || "No se pudo eliminar la alerta.");
    } finally {
      setProcessingId(null);
    }
  };

  return {
    alerts,
    loading,
    refreshing,
    processingId,
    refresh,
    toggleActive,
    deleteAlert,
    getAlertSummary,
  };
}
