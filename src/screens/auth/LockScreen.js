import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { authenticate, getBiometricType } from "../../services/biometricService";
import { Colors, Spacing, FontSize } from "../../constants/theme";
import LogoHallado from "../../components/LogoHallado";

export default function LockScreen() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("Biometria");

  useEffect(() => {
    loadBiometricType();
    // Delay to let navigation finish before invoking native biometric prompt
    const timer = setTimeout(() => {
      handleUnlock();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  async function loadBiometricType() {
    try {
      const type = await getBiometricType();
      setBiometricLabel(type);
    } catch {
      // ignore
    }
  }

  async function handleUnlock() {
    setError("");
    setLoading(true);
    try {
      const result = await authenticate();
      if (result.success) {
        router.replace("/(tabs)/home");
      } else {
        setError("No se pudo verificar tu identidad");
      }
    } catch (err) {
      setError("Error al autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBg}>
            <LogoHallado size={60} color={Colors.textOnPrimary} />
          </View>
        </View>

        <Text style={styles.title}>Hallado esta bloqueado</Text>
        <Text style={styles.subtitle}>
          Usa {biometricLabel} para desbloquear
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleUnlock}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textOnPrimary} />
          ) : (
            <Text style={styles.buttonText}>DESBLOQUEAR</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  logoContainer: {
    marginBottom: Spacing.xl,
  },
  logoBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "bold",
    color: Colors.textOnPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.md,
    width: "100%",
  },
  errorText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.sm,
    textAlign: "center",
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: Colors.textOnPrimary,
    borderRadius: 10,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    width: "100%",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.md,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
