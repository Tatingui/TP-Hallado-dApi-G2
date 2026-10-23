import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { isBiometricEnabled } from "../services/biometricService";
import { Colors } from "../constants/theme";

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Esperar a que AuthContext termine de restaurar

    if (isAuthenticated) {
      checkBiometricAndRedirect();
    } else {
      router.replace("/(auth)/login");
    }
  }, [loading, isAuthenticated]);

  async function checkBiometricAndRedirect() {
    try {
      const bioEnabled = await isBiometricEnabled();
      if (bioEnabled) {
        router.replace("/(auth)/lock");
      } else {
        router.replace("/(tabs)/home");
      }
    } catch {
      router.replace("/(tabs)/home");
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
});
