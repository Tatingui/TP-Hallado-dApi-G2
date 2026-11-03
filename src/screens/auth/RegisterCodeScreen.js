import { useNavigation, useRoute } from "@react-navigation/native";
import { startRegistration, verifyRegistrationCode } from "../../services/authService";
import OtpVerificationView from "../../components/auth/OtpVerificationView";

/**
 * Registro, paso 2 de 3: el código enviado al email.
 */
export default function RegisterCodeScreen() {
  const navigation = useNavigation();
  const { email, nextState } = useRoute().params ?? {};

  function handleVerified(_response, code) {
    navigation.navigate("CompleteRegistration", { email, code, nextState });
  }

  return (
    <OtpVerificationView
      email={email}
      title="Verificá tu email"
      description="Enviamos un código de 6 dígitos a"
      submitLabel="VERIFICAR"
      verify={(code) => verifyRegistrationCode(email, code)}
      onVerified={handleVerified}
      resend={() => startRegistration(email)}
    />
  );
}
