import { useState, useEffect } from "react";
import { View, Text, Pressable, Switch, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { getUserEmail, clearSession } from "../../storage/authStorage";
import { Colors, Spacing, FontSize } from "../../constants/theme";
import LogoHallado from "../../components/LogoHallado";
import {
  hasBiometricHardware,
  getBiometricType,
  isBiometricEnabled,
  setBiometricEnabled,
  clearBiometricEnabled,
} from "../../services/biometricService";

export default function HomeScreen() {
  const [email, setEmail] = useState("");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricOn, setBiometricOn] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("Bloqueo biometrico");

  useEffect(() => {
    loadUser();
    loadBiometricState();
  }, []);

  async function loadUser() {
    try {
      const userEmail = await getUserEmail();
      if (userEmail) setEmail(userEmail);
    } catch {
      // ignore
    }
  }

  async function loadBiometricState() {
    try {
      const available = await hasBiometricHardware();
      setBiometricAvailable(available);
      if (available) {
        const type = await getBiometricType();
        setBiometricLabel("Bloqueo con " + type);
        const enabled = await isBiometricEnabled();
        setBiometricOn(enabled);
      }
    } catch {
      setBiometricAvailable(false);
    }
  }

  async function handleToggleBiometric(value) {
    try {
      if (value) {
        const available = await hasBiometricHardware();
        if (!available) {
          Alert.alert(
            "No disponible",
            "Tu dispositivo no tiene biometria configurada."
          );
          return;
        }
      }
      await setBiometricEnabled(value);
      setBiometricOn(value);
    } catch {
      Alert.alert("Error", "No se pudo cambiar la configuracion.");
    }
  }

  async function handleLogout() {
    await clearBiometricEnabled();
    await clearSession();
    router.replace("/(auth)/login");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <LogoHallado size={32} color={Colors.textOnPrimary} />
          <Text style={styles.headerTitle}>Hallado</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcome}>Bienvenido</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}
        <Text style={styles.placeholder}>
          El feed de publicaciones se implementa en los proximos incrementos.
        </Text>

        {biometricAvailable ? (
          <View style={styles.biometricRow}>
            <View style={styles.biometricInfo}>
              <Text style={styles.biometricLabel}>{biometricLabel}</Text>
              <Text style={styles.biometricHint}>
                Pide autenticacion al abrir la app
              </Text>
            </View>
            <Switch
              value={biometricOn}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: Colors.disabled, true: Colors.primaryLight }}
              thumbColor={biometricOn ? Colors.primary : Colors.surface}
            />
          </View>
        ) : null}

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesion</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    color: Colors.textOnPrimary,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  welcome: {
    fontSize: FontSize.xxl,
    fontWeight: "bold",
    color: Colors.text,
  },
  email: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  placeholder: {
    fontSize: FontSize.sm,
    color: Colors.disabled,
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  biometricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    width: "100%",
  },
  biometricInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  biometricLabel: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
  },
  biometricHint: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 10,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  logoutText: {
    color: Colors.error,
    fontSize: FontSize.md,
    fontWeight: "600",
  },
});
