import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import { isLoggedIn } from "../storage/authStorage";
import { isBiometricEnabled } from "../services/biometricService";
import { Colors } from "../constants/theme";

export default function Index() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const logged = await isLoggedIn();
      if (logged) {
        const bioEnabled = await isBiometricEnabled();
        if (bioEnabled) {
          router.replace("/(auth)/lock");
        } else {
          router.replace("/(tabs)/home");
        }
      } else {
        router.replace("/(auth)/login");
      }
    } catch {
      router.replace("/(auth)/login");
    } finally {
      setChecking(false);
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
