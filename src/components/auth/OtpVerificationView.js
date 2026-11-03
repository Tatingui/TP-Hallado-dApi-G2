import { useState } from "react";
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
import { Colors, Spacing, FontSize } from "../../constants/theme";
import LogoHallado from "../LogoHallado";
import { useOtpInput } from "../../hooks/useOtpInput";
import { useCountdown } from "../../hooks/useCountdown";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;
const CONNECTION_ERROR = "Error de conexión con el servidor";

/**
 * Pantalla de ingreso de un código OTP de 6 dígitos, con verificación y reenvío.
 * Es común al registro y al recupero de contraseña: cada pantalla define
 * los textos y qué hacer con el código (props `verify`, `onVerified` y `resend`).
 *
 * `verify` y `resend` devuelven la respuesta del backend ({ success, message }).
 */
export default function OtpVerificationView({
  email,
  title,
  description,
  submitLabel,
  verify,
  onVerified,
  resend,
}) {
  const otp = useOtpInput(OTP_LENGTH);
  const resendCountdown = useCountdown(RESEND_COOLDOWN_SECONDS);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  function handleChange(text, index) {
    otp.changeDigit(text, index);
    setError("");
  }

  async function handleVerify() {
    if (!otp.isComplete) {
      setError(`Ingresá los ${OTP_LENGTH} dígitos del código`);
      return;
    }

    setError("");
    setVerifying(true);
    try {
      const response = await verify(otp.code);
      if (response.success) {
        await onVerified(response, otp.code);
      } else {
        setError(response.message || "Código inválido");
        otp.clear();
      }
    } catch {
      setError(CONNECTION_ERROR);
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (resendCountdown.isRunning || resending) return;

    setResending(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await resend();
      if (response.success) {
        setSuccessMessage("Código reenviado a tu email");
        resendCountdown.restart();
        otp.clear();
      } else {
        setError(response.message || "No se pudo reenviar el código");
      }
    } catch {
      setError(CONNECTION_ERROR);
    } finally {
      setResending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.iconBg}>
          <LogoHallado size={36} color={Colors.textOnPrimary} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {description}{"\n"}
          <Text style={styles.emailText}>{email}</Text>
        </Text>

        <View style={styles.otpRow}>
          {otp.digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={otp.registerInput(index)}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : null,
                error ? styles.otpInputError : null,
              ]}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(event) => otp.handleKeyPress(event, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        <Pressable
          style={[styles.button, verifying && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={verifying}
        >
          {verifying ? (
            <ActivityIndicator color={Colors.textOnPrimary} />
          ) : (
            <Text style={styles.buttonText}>{submitLabel}</Text>
          )}
        </Pressable>

        <View style={styles.resendContainer}>
          {resendCountdown.isRunning ? (
            <Text style={styles.resendTimer}>
              Reenviar código en {resendCountdown.remaining}s
            </Text>
          ) : (
            <Pressable onPress={handleResend} disabled={resending}>
              {resending ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.resendLink}>Reenviar código</Text>
              )}
            </Pressable>
          )}
        </View>

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
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
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
