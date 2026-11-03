import { useState } from "react";
import { Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { resetPassword } from "../../services/authService";
import AuthFormLayout, { authFieldStyles } from "../../components/auth/AuthFormLayout";
import NewPasswordFields from "../../components/auth/NewPasswordFields";
import { validateNewPassword } from "../../components/PasswordCriteria";

/**
 * Recupero de contraseña, último paso: definir la nueva contraseña
 * con el código ya validado en la pantalla anterior.
 */
export default function NewPasswordScreen() {
  const navigation = useNavigation();
  const { email, code, nextState } = useRoute().params ?? {};
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    const validationError = validateNewPassword(password, confirmation);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await resetPassword(email, code, password);
      if (response.success) {
        navigation.reset({ index: 0, routes: [{ name: "Login", params: { resetSuccess: "true", nextState } }] });
      } else {
        setError(response.message || "No se pudo restablecer la contraseña");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormLayout
      title="Nueva contraseña"
      subtitle={<>Elegí tu nueva contraseña para{"\n"}<Text style={authFieldStyles.emphasis}>{email}</Text></>}
      error={error}
      submitLabel="RESTABLECER CONTRASEÑA"
      onSubmit={handleReset}
      loading={loading}
    >
      <NewPasswordFields
        password={password}
        confirmation={confirmation}
        onChangePassword={setPassword}
        onChangeConfirmation={setConfirmation}
        passwordLabel="Nueva contraseña"
      />
    </AuthFormLayout>
  );
}
