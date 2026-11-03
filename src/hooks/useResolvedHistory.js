import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import {
  getResolvedHistoryApi,
  rateResolvedCaseApi,
} from "../services/claimService";
import { toLocalDateString } from "../utils/date";

/**
 * Hook que encapsula el historial de casos resueltos: filtros (tipo y rango
 * de fechas), carga del listado y envío de valoraciones.
 */
export default function useResolvedHistory() {
  const [cases, setCases] = useState([]);
  const [type, setType] = useState("ALL");
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCases(
        await getResolvedHistoryApi({
          type,
          from: from && toLocalDateString(from),
          to: to && toLocalDateString(to),
        }),
      );
    } catch (error) {
      Alert.alert("Error", error?.message || "No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  }, [type, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * Envía la valoración de un caso y recarga el historial.
   * Devuelve true si se guardó; si falla, avisa con Alert y devuelve false.
   */
  const rateCase = useCallback(async (item, { positive, message, thanks }) => {
    try {
      await rateResolvedCaseApi(item.claimId, {
        positive,
        message,
        publicThanks: item.canThank ? thanks : null,
      });
    } catch (error) {
      Alert.alert(
        "No se pudo guardar",
        error?.message || "Intentá nuevamente.",
      );
      return false;
    }
    load();
    return true;
  }, [load]);

  return {
    cases,
    loading,
    type,
    setType,
    from,
    setFrom,
    to,
    setTo,
    reload: load,
    rateCase,
  };
}
