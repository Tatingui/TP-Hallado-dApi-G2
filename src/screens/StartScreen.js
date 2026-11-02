import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../hooks/useAuth";
import { isBiometricEnabled } from "../services/biometricService";
import { isTokenExpired } from "../storage/authStorage";
import { Colors } from "../constants/theme";

export default function Index() {
  const navigation = useNavigation();
  const { isAuthenticated, token, loading, logout } = useAuth();

  useEffect(() => {
    if (loading) return; // Esperar a que AuthContext termine de restaurar

    if (isAuthenticated) {
      if (isTokenExpired(token)) {
        // Token vencido: limpiar sesion y mandar al login
        logout();
      } else {
        checkBiometricAndRedirect();
      }
    } else {
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  }, [loading, isAuthenticated]);

  async function checkBiometricAndRedirect() {
    try {
      const bioEnabled = await isBiometricEnabled();
      if (bioEnabled) {
        navigation.reset({ index: 0, routes: [{ name: "Lock" }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: "Main" }] });
      }
    } catch {
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
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
