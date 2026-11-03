import { useCallback } from "react";
import { Alert, Linking } from "react-native";

export default function useOpenCoordinates(latitude, longitude) {
  return useCallback(async () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${Number(latitude)},${Number(longitude)}`;

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir Google Maps.");
    }
  }, [latitude, longitude]);
}
