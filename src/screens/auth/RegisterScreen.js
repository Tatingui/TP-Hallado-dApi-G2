import { useState } from "react";
import { Text, TextInput, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { startRegistration } from "../../services/authService";
import { Colors } from "../../constants/theme";
import AuthFormLayout, { authFieldStyles } from "../../components/auth/AuthFormLayout";

/**
 * Registro, paso 1 de 3: el email. Se le envía un código de verificación.
 */
export default function RegisterScreen() {
  const navigation = useNavigation();
  const { nextState } = useRoute().params ?? {};
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Ingresá tu email");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await startRegistration(trimmedEmail);
      if (response.success) {
        navigation.navigate("RegisterCode", { email: trimmedEmail, nextState });
      } else {
        setError(response.message || "No se pudo iniciar el registro");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormLayout
      title="Crear cuenta"
      subtitle="Ingresá tu email y te enviamos un código para verificarlo"
      error={error}
      submitLabel="CONTINUAR"
      onSubmit={handleContinue}
      loading={loading}
      footer={
        <Pressable style={authFieldStyles.linkContainer} onPress={() => navigation.goBack()}>
          <Text style={authFieldStyles.linkText}>
            ¿Ya tenés cuenta? <Text style={authFieldStyles.linkBold}>Iniciá sesión</Text>
          </Text>
        </Pressable>
      }
    >
      <Text style={authFieldStyles.label}>Email</Text>
      <TextInput
        style={authFieldStyles.input}
        placeholder="tu@email.com"
        placeholderTextColor={Colors.disabled}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
    </AuthFormLayout>
  );
}
