import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { getPublicProfile } from "../services/userService";

/**
 * Hook que carga el perfil público de un usuario a partir de su id.
 * Mientras no haya id, se mantiene en estado de carga.
 */
export default function usePublicProfile(id) {
  const [loading, setLoading] = useState(true);
  const [publicData, setPublicData] = useState(null);

  useEffect(() => {
    if (id) {
      loadPublicProfile(id);
    }
  }, [id]);

  async function loadPublicProfile(userId) {
    try {
      setLoading(true);
      const data = await getPublicProfile(userId);
      setPublicData(data);
    } catch (err) {
      Alert.alert(
        "Error",
        err?.message || "No se pudo cargar el perfil público solicitado.",
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    publicData,
  };
}
