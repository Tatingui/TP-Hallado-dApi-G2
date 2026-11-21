import * as BackgroundTask from "expo-background-task";
import { BackgroundTaskResult } from "expo-background-task";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { getToken } from "../storage/authStorage";
import { peekDatabaseSession } from "../database/session";
import {
  fetchAndSaveClaimNotifications,
  getClaimNotificationNavigation,
} from "../repositories/claimNotificationRepository";

// Nombre único de la tarea; debe coincidir en defineTask y registerTaskAsync
const TASK_NAME = "chequear-novedades";

// La definición debe estar en el scope del módulo, FUERA de cualquier componente.
// expo-task-manager necesita registrar la tarea cuando el módulo se importa por primera vez,
// antes de que React monte la UI, porque el SO puede activar la tarea incluso sin UI visible.
TaskManager.defineTask(TASK_NAME, async () => {
  try {
    // Hacemos un único fetch corto — NO es long polling real.
    // expo-background-task ejecuta esta función una sola vez y la termina;
    // no es posible mantener una conexión HTTP abierta en background con esta API.
    // Para long polling real en background se necesitaría un servidor push (FCM/APNs).
    const token = await getToken();
    if (!token) return BackgroundTaskResult.Failed;

    const session = peekDatabaseSession();
    if (!session) return BackgroundTaskResult.Failed;
    const novedades = await fetchAndSaveClaimNotifications(token, session);

    // Si el backend devuelve un array con al menos un elemento, hay novedades
    if (Array.isArray(novedades) && novedades.length > 0) {
      // Disparamos una notificación local inmediata (trigger: null = ahora)
      for (const novedad of novedades) {
        const navigationData = getClaimNotificationNavigation(novedad);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: novedad.title || "Hay novedades",
            body: novedad.message || "Tenés notificaciones nuevas",
            data: navigationData,
          },
          trigger: null,
        });
      }
      return BackgroundTaskResult.Success;
    }

    // Sin novedades: la tarea se completó pero no había nada que hacer
    return BackgroundTaskResult.Failed;
  } catch (error) {
    // Error de red o de parseo — el SO puede usar esto para ajustar la frecuencia
    console.warn("[background-task] Error al chequear novedades:", error);
    return BackgroundTaskResult.Failed;
  }
});

// Registra la tarea para que el SO la despierte periódicamente.
// minimumInterval: 15 minutos (mínimo real que respeta Android; iOS no lo garantiza).
export async function registrarTareaBackground() {
  try {
    // Verificamos antes de registrar para que la operación sea idempotente:
    // si se llama dos veces (doble montaje en StrictMode), no falla ni duplica la tarea
    const estaRegistrada = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (!estaRegistrada) {
      await BackgroundTask.registerTaskAsync(TASK_NAME, {
        minimumInterval: 15,
      });
      console.log("[background-task] Tarea registrada:", TASK_NAME);
    }
  } catch (error) {
    // No es crítico si falla el registro — la app funciona igual en foreground
    console.warn("[background-task] Error al registrar la tarea:", error);
  }
}

// Cancela la tarea — llamar al cerrar sesión para no chequear sin usuario activo
export async function desregistrarTareaBackground() {
  try {
    const estaRegistrada = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (estaRegistrada) {
      await BackgroundTask.unregisterTaskAsync(TASK_NAME);
      console.log("[background-task] Tarea desregistrada:", TASK_NAME);
    }
  } catch (error) {
    console.warn("[background-task] Error al desregistrar la tarea:", error);
  }
}
