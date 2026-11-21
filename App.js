import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider } from "./src/context/AuthContext";
import { useAuth } from "./src/hooks/useAuth";
import AppNavigator from "./src/navigation/AppNavigator";
import { startSyncCoordinator } from "./src/sync/syncCoordinator";
import { registrarTareaBackground } from "./src/tasks/backgroundNotificationsTask";
import { navigationRef } from "./src/navigation/navigationRef";
import { iniciarEscuchaNovedades } from "./src/services/novedadesListener";
import { peekDatabaseSession } from "./src/database/session";

function GlobalOfflineSyncWatcher({ children }) {
  const { token, user, loading } = useAuth();
  useEffect(() => {
    if (token && user && !loading) return startSyncCoordinator();
  }, [token, user, loading]);
  return children;
}

function GlobalClaimNotificationsPoller() {
  const { token, user, loading } = useAuth();

  // Loop de long polling que vive mientras haya sesión; el cleanup lo corta al cerrar sesión.
  useEffect(() => {
    if (!token || !user || loading) return undefined;
    const session = peekDatabaseSession();
    if (!session) return undefined;
    return iniciarEscuchaNovedades(token, session);
  }, [token, user, loading]);

  // La tarea de background se registra con sesión activa (logout la desregistra,
  // así que hay que volver a registrarla al iniciar sesión de nuevo).
  useEffect(() => {
    if (token) registrarTareaBackground();
  }, [token]);

  return null;
}

// Configura cómo mostrar las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  // Al montar la app: pedimos permiso de notificaciones (sin permiso no se muestra nada).
  useEffect(() => {
    Notifications.requestPermissionsAsync().then(({ status }) => {
      if (status !== "granted") {
        console.warn("[App] Permiso de notificaciones denegado");
      }
    });
  }, []);


  useEffect(() => {
    const openClaimFromNotification = (response) => {
      const data = response.notification.request.content.data || {};
      if (!data.claimId) return;

      const navigateToClaim = () => {
        if (!navigationRef.isReady()) return;
        navigationRef.navigate("Main", {
          screen: "ClaimsTab",
          params: {
            tab: data.tab === "received" ? "received" : "sent",
            claimId: String(data.claimId),
          },
        });
      };

      if (navigationRef.isReady()) {
        navigateToClaim();
      } else {
        setTimeout(navigateToClaim, 500);
      }
    };

    const subscription = Notifications.addNotificationResponseReceivedListener(openClaimFromNotification);
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) openClaimFromNotification(response);
    });
    return () => subscription.remove();
  }, []);

  return (
    <AuthProvider>
      <GlobalClaimNotificationsPoller />
      <GlobalOfflineSyncWatcher>
        <StatusBar style="dark" />
        <AppNavigator />
      </GlobalOfflineSyncWatcher>
    </AuthProvider>
  );
}
