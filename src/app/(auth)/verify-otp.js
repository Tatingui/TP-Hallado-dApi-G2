import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { verifyOtp, resendOtp } from "../../services/authService";
import { saveSession } from "../../storage/authStorage";
import { Colors, Spacing, FontSize } from "../../constants/theme";
import LogoHallado from "../../components/LogoHallado";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyOtpScreen() {
  const { email, fromRegister } = useLocalSearchParams();
  const [code, setCode] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [resendLoading, setResendLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const inputRefs = useRef([]);

  // Timer de reenvío
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  function handleChange(text, index) {
    // Solo números
    const digit = text.replace(/[^0-9]/g, "");
    if (digit.length > 1) return;

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError("");

    // Avanzar al siguiente input
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

  async function handleVerify() {
    const fullCode = code.join("");
    if (fullCode.length !== OTP_LENGTH) {
      setError("Ingresá los 6 dígitos del código");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await verifyOtp(email, fullCode);

      if (response.success) {
        await saveSession(response.token, email);
        router.replace("/(tabs)/home");
      } else {
        setError(response.message || "Código inválido");
        setCode(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
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
      <View style={styles.content}>
        {/* Icono */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBg}>
            <LogoHallado size={36} color={Colors.textOnPrimary} />
          </View>
        </View>

        <Text style={styles.title}>Verificá tu email</Text>
        <Text style={styles.subtitle}>
          Enviamos un código de 6 dígitos a{"\n"}
          <Text style={styles.emailText}>{email}</Text>
        </Text>

        {/* Inputs OTP */}
        <View style={styles.otpRow}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : null,
                error ? styles.otpInputError : null,
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

        {/* Botón verificar */}
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textOnPrimary} />
          ) : (
            <Text style={styles.buttonText}>VERIFICAR</Text>
          )}
        </Pressable>

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

        {/* Info */}
        <Text style={styles.infoText}>
          El código expira en 5 minutos. Revisá tu bandeja de spam si no lo
          encontrás.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: Spacing.xl,
  },
  emailText: {
    fontWeight: "bold",
    color: Colors.text,
  },
  otpRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: Spacing.lg,
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
  resendContainer: {
    marginTop: Spacing.lg,
    alignItems: "center",
    minHeight: 30,
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
  infoText: {
    fontSize: 12,
    color: Colors.disabled,
    textAlign: "center",
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
});
