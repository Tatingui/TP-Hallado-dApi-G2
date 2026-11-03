import {
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Colors, Spacing, FontSize } from "../../constants/theme";
import LogoHallado from "../LogoHallado";

/**
 * Estructura común de los formularios de autenticación:
 * logo, título, subtítulo, mensaje de error, campos y botón principal.
 */
export default function AuthFormLayout({
  title,
  subtitle,
  error,
  submitLabel,
  onSubmit,
  loading = false,
  children,
  footer = null,
}) {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoBg}>
            <LogoHallado size={40} color={Colors.textOnPrimary} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {children}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textOnPrimary} />
            ) : (
              <Text style={styles.buttonText}>{submitLabel}</Text>
            )}
          </Pressable>

          {footer}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Estilos de los campos para usar dentro de AuthFormLayout. */
export const authFieldStyles = StyleSheet.create({
  label: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
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
  emphasis: {
    fontWeight: "bold",
    color: Colors.text,
  },
  linkContainer: {
    marginTop: Spacing.lg,
    alignItems: "center",
  },
  linkText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  linkBold: {
    color: Colors.primary,
    fontWeight: "bold",
  },
});

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
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logoBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: "center",
    lineHeight: 20,
  },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  errorBox: {
    backgroundColor: Colors.errorLight,
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.lg,
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
});
