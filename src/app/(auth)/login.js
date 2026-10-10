import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { login } from "../../services/authService";
import { saveSession } from "../../storage/authStorage";
import { Colors, Spacing, FontSize } from "../../constants/theme";
import LogoHallado from "../../components/LogoHallado";
import PasswordInput from "../../components/PasswordInput";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetSuccess } = useLocalSearchParams();

  async function handleLogin() {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const data = await login(email.trim(), password);

      if (data.success && data.token) {
        await saveSession(data.token, email.trim());
        router.replace("/(tabs)/home");
      } else if (data.requiresVerification) {
        router.push({
          pathname: "/(auth)/verify-otp",
          params: { email: email.trim(), fromLogin: "true" },
        });
      } else {
        setError(data.message || "Error al iniciar sesion");
      }
    } catch (e) {
      if (e.message) {
        setError(e.message);
      } else {
        setError("Error de conexion. Verifica que el servidor este corriendo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Icono */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <LogoHallado size={50} color={Colors.textOnPrimary} />
          </View>
          <Text style={styles.appName}>Hallado</Text>
          <Text style={styles.subtitle}>Encontra lo que perdiste</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <Text style={styles.title}>Iniciar Sesion</Text>

          {resetSuccess ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                Contrasena restablecida. Inicia sesion con tu nueva contrasena.
              </Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor={Colors.disabled}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contrasena</Text>
            <PasswordInput
              value={password}
              onChangeText={setPassword}
              placeholder="Tu contrasena"
            />
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textOnPrimary} />
            ) : (
              <Text style={styles.buttonText}>INGRESAR</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.forgotContainer}
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <Text style={styles.forgotText}>Olvidaste tu contrasena?</Text>
          </Pressable>

          <Pressable
            style={styles.linkButton}
            onPress={() => router.push("/(auth)/register")}
          >
            <Text style={styles.linkText}>
              No tenes cuenta?{" "}
              <Text style={styles.linkBold}>Registrate</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.lg,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: FontSize.xxl,
    fontWeight: "bold",
    color: Colors.primary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 10,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorContainer: {
    backgroundColor: Colors.errorLight,
    borderRadius: 8,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    textAlign: "center",
  },
  successBox: {
    backgroundColor: "#DCFCE7",
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  successText: {
    color: Colors.success,
    fontSize: FontSize.sm,
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  buttonDisabled: {
    backgroundColor: Colors.disabled,
  },
  buttonText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.md,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  linkButton: {
    marginTop: Spacing.lg,
    alignItems: "center",
  },
  linkText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  linkBold: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  forgotContainer: {
    marginTop: Spacing.md,
    alignItems: "center",
  },
  forgotText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: "600",
  },
});
