import { useState } from "react";
import { Text, TextInput } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { completeRegistration } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import { Colors } from "../../constants/theme";
import AuthFormLayout, { authFieldStyles } from "../../components/auth/AuthFormLayout";
import NewPasswordFields from "../../components/auth/NewPasswordFields";
import { validateNewPassword } from "../../components/PasswordCriteria";

/**
 * Registro, paso 3 de 3: con el email verificado, se definen nombre y contraseña.
 * Al completarlo se inicia la sesión.
 */
export default function CompleteRegistrationScreen() {
  const navigation = useNavigation();
  const { email, code, nextState } = useRoute().params ?? {};
  const { login } = useAuth();
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    const validationError = nombre.trim()
      ? validateNewPassword(password, confirmation)
      : "Ingresá tu nombre";
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await completeRegistration(email, code, nombre.trim(), password);
      if (response.success) {
        await login(response.token, email);
        navigation.reset(nextState ?? { index: 0, routes: [{ name: "Main" }] });
      } else {
        setError(response.message || "No se pudo completar el registro");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormLayout
      title="Último paso"
      subtitle={<>Elegí tu nombre y contraseña para{"\n"}<Text style={authFieldStyles.emphasis}>{email}</Text></>}
      error={error}
      submitLabel="CREAR CUENTA"
      onSubmit={handleComplete}
      loading={loading}
    >
      <Text style={authFieldStyles.label}>Nombre completo</Text>
      <TextInput
        style={authFieldStyles.input}
        placeholder="Ej: Juan Pérez"
        placeholderTextColor={Colors.disabled}
        value={nombre}
        onChangeText={setNombre}
        autoCapitalize="words"
      />

      <NewPasswordFields
        password={password}
        confirmation={confirmation}
        onChangePassword={setPassword}
        onChangeConfirmation={setConfirmation}
      />
    </AuthFormLayout>
  );
}
