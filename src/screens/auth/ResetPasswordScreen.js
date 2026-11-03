import { useNavigation, useRoute } from "@react-navigation/native";
import { verifyResetCode, resendOtp } from "../../services/authService";
import OtpVerificationView from "../../components/auth/OtpVerificationView";

/**
 * Recupero de contraseña: ingreso del código recibido por email.
 * Al verificarlo (sin consumirlo), continúa a la pantalla para elegir la nueva contraseña.
 */
export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const { email, nextState } = useRoute().params ?? {};

  function handleVerified(_response, code) {
    navigation.navigate("NewPassword", { email, code, nextState });
  }

  return (
    <OtpVerificationView
      email={email}
      title="Verificar código"
      description="Ingresá el código de 6 dígitos enviado a"
      submitLabel="VERIFICAR CÓDIGO"
      verify={(code) => verifyResetCode(email, code)}
      onVerified={handleVerified}
      resend={() => resendOtp(email)}
    />
  );
}
