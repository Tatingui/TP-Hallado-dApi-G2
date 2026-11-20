import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider } from "./src/context/AuthContext";
import { useAuth } from "./src/hooks/useAuth";
import AppNavigator from "./src/navigation/AppNavigator";
import { startSyncCoordinator } from "./src/sync/syncCoordinator";
import { registrarTareaBackground } from "./src/tasks/backgroundNotificationsTask";

function GlobalOfflineSyncWatcher({ children }) {
  const { token, user, loading } = useAuth();
  useEffect(() => {
    if (token && user && !loading) return startSyncCoordinator();
  }, [token, user, loading]);
  return children;
}

// Configura cómo mostrar las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  // Al montar la app: pedimos permiso de notificaciones y registramos la tarea background.
  // Se piden permisos apenas se abre la app porque esto está en el componente de mayor jerarquía.
  // Solo se ejecuta una vez (array vacío []) para no duplicar el registro.
  useEffect(() => {
    const inicializar = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("[App] Permiso de notificaciones denegado");
        return;
      }
      await registrarTareaBackground();
    };
    inicializar();
  }, []);

  return (
    <AuthProvider>
      <GlobalOfflineSyncWatcher>
        <StatusBar style="dark" />
        <AppNavigator />
      </GlobalOfflineSyncWatcher>
    </AuthProvider>
  );
}
