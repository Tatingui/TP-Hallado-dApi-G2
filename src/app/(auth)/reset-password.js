import { useState, useRef, useEffect } from "react";
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
import { resetPassword, resendOtp } from "../../services/authService";
import { Colors, Spacing, FontSize } from "../../constants/theme";
import LogoHallado from "../../components/LogoHallado";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [resendLoading, setResendLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  function handleChange(text, index) {
    const digit = text.replace(/[^0-9]/g, "");
    if (digit.length > 1) return;

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError("");

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(e, index) {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
    }
  }

  async function handleReset() {
    const fullCode = code.join("");

    if (fullCode.length !== OTP_LENGTH) {
      setError("Ingresá los 6 dígitos del código");
      return;
    }
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Completá ambos campos de contraseña");
      return;
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await resetPassword(email, fullCode, newPassword);

      if (response.success) {
        router.replace({
          pathname: "/(auth)/login",
          params: { resetSuccess: "true" },
        });
      } else {
        setError(response.message || "No se pudo restablecer la contraseña");
        if (response.message && response.message.toLowerCase().includes("código")) {
          setCode(Array(OTP_LENGTH).fill(""));
          inputRefs.current[0]?.focus();
        }
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendTimer > 0 || resendLoading) return;

    setResendLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const response = await resendOtp(email);
      if (response.success) {
        setSuccessMsg("Código reenviado a tu email");
        setResendTimer(RESEND_COOLDOWN);
        setCode(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      } else {
        setError(response.message || "No se pudo reenviar el código");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setResendLoading(false);
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
        <View style={styles.header}>
          <View style={styles.iconBg}>
            <LogoHallado size={36} color={Colors.textOnPrimary} />
          </View>
          <Text style={styles.title}>Nueva contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresá el código enviado a{"\n"}
            <Text style={styles.emailText}>{email}</Text>
            {"\n"}y elegí tu nueva contraseña.
          </Text>
        </View>

        {/* OTP inputs */}
        <View style={styles.otpRow}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : null,
                error && code.join("").length < OTP_LENGTH ? styles.otpInputError : null,
              ]}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Reenviar */}
        <View style={styles.resendContainer}>
          {resendTimer > 0 ? (
            <Text style={styles.resendTimer}>
              Reenviar código en {resendTimer}s
            </Text>
          ) : (
            <Pressable onPress={handleResend} disabled={resendLoading}>
              {resendLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.resendLink}>Reenviar código</Text>
              )}
            </Pressable>
          )}
        </View>

        {/* Nueva contraseña */}
        <View style={styles.form}>
          <Text style={styles.label}>Nueva contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={Colors.disabled}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Repetí tu contraseña"
            placeholderTextColor={Colors.disabled}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {/* Mensajes */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {successMsg ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{successMsg}</Text>
          </View>
        ) : null}

        {/* Botón */}
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textOnPrimary} />
          ) : (
            <Text style={styles.buttonText}>RESTABLECER CONTRASEÑA</Text>
          )}
        </Pressable>
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
    alignItems: "center",
    padding: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  emailText: {
    fontWeight: "bold",
    color: Colors.text,
  },
  otpRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: Spacing.sm,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    textAlign: "center",
    fontSize: FontSize.xl,
    fontWeight: "bold",
    color: Colors.text,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  otpInputError: {
    borderColor: Colors.error,
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
    minHeight: 24,
    justifyContent: "center",
  },
  resendTimer: {
    fontSize: FontSize.sm,
    color: Colors.disabled,
  },
  resendLink: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: "bold",
  },
  form: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
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
  errorBox: {
    backgroundColor: Colors.errorLight,
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.md,
    width: "100%",
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
    width: "100%",
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
    width: "100%",
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
