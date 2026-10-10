import { Stack } from "expo-router";
import { Colors } from "../../constants/theme";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.textOnPrimary,
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ title: "Crear cuenta" }} />
      <Stack.Screen name="verify-otp" options={{ title: "Verificar email" }} />
      <Stack.Screen name="forgot-password" options={{ title: "Recuperar contraseña" }} />
      <Stack.Screen name="reset-password" options={{ title: "Nueva contraseña" }} />
      <Stack.Screen name="lock" options={{ headerShown: false }} />
    </Stack>
  );
}
