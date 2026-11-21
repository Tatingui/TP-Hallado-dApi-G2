import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider } from "./src/context/AuthContext";
import { useAuth } from "./src/hooks/useAuth";
import AppNavigator from "./src/navigation/AppNavigator";
import { startSyncCoordinator } from "./src/sync/syncCoordinator";
import { registrarTareaBackground } from "./src/tasks/backgroundNotificationsTask";
import { navigationRef } from "./src/navigation/navigationRef";
import { fetchAndSaveClaimNotifications } from "./src/repositories/claimNotificationRepository";
import { peekDatabaseSession } from "./src/database/session";

function GlobalOfflineSyncWatcher({ children }) {
  const { token, user, loading } = useAuth();
  useEffect(() => {
    if (token && user && !loading) return startSyncCoordinator();
  }, [token, user, loading]);
  return children;
}

function GlobalClaimNotificationsPoller() {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return undefined;

    const checkNotifications = async () => {
      const session = peekDatabaseSession();
      if (!session) return;

      try {
        const saved = await fetchAndSaveClaimNotifications(token, session);
        for (const notification of saved) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: notification.title,
              body: notification.message,
              data: notification.claimId
                ? {
                    claimId: String(notification.claimId),
                    tab: notification.type === "CLAIM_RECEIVED"
                      || notification.type === "MEETING_POINT_PROPOSED"
                      ? "received"
                      : "sent",
                  }
                : {},
            },
            trigger: null,
          });
        }
      } catch (error) {
        console.warn("[novedades] Error consultando reclamos:", error);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  return null;
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
