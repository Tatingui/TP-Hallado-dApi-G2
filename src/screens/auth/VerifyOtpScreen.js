import { useNavigation, useRoute } from "@react-navigation/native";
import { verifyOtp, resendOtp } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import OtpVerificationView from "../../components/auth/OtpVerificationView";

/**
 * Verificación del email con el código OTP (registro o login de una cuenta sin verificar).
 * Al verificar, inicia la sesión con el token recibido.
 */
export default function VerifyOtpScreen() {
  const navigation = useNavigation();
  const { email, nextState } = useRoute().params ?? {};
  const { login } = useAuth();

  async function handleVerified(response) {
    await login(response.token, email);
    navigation.reset(nextState ?? { index: 0, routes: [{ name: "Main" }] });
  }

  return (
    <OtpVerificationView
      email={email}
      title="Verificá tu email"
      description="Enviamos un código de 6 dígitos a"
      submitLabel="VERIFICAR"
      verify={(code) => verifyOtp(email, code)}
      onVerified={handleVerified}
      resend={() => resendOtp(email)}
    />
  );
}
