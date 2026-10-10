import { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { getUserEmail, clearSession } from "../../storage/authStorage";
import { Colors, Spacing, FontSize } from "../../constants/theme";

export default function HomeScreen() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const userEmail = await getUserEmail();
    if (userEmail) setEmail(userEmail);
  }

  async function handleLogout() {
    await clearSession();
    router.replace("/(auth)/login");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hallado</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcome}>Bienvenido</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}
        <Text style={styles.placeholder}>
          El feed de publicaciones se implementa en los próximos incrementos.
        </Text>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
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
