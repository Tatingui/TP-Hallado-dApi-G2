import * as Notifications from "expo-notifications";
import {
  fetchAndSaveClaimNotifications,
  notifyClaimNotifications,
} from "../repositories/claimNotificationRepository";
import { isCurrentSession } from "../database/session";

// Loop de long polling (patrón visto en clase): el servidor retiene la respuesta hasta
// 25 s y la app vuelve a pedir apenas termina. Las novedades se guardan en la bandeja
// y se muestran como notificación local.

const RETRY_DELAY_MS = 5000;
const listeners = new Set();

/** Permite a las pantallas refrescarse cuando llegan novedades nuevas. */
export function subscribeNovedades(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Inicia el loop. Devuelve la función de cleanup que lo corta. */
export function iniciarEscuchaNovedades(token, session) {
  let activo = true;
  const controller = new AbortController();

  async function escuchar() {
    while (activo && isCurrentSession(session)) {
      try {
        const saved = await fetchAndSaveClaimNotifications(
          token,
          session,
          controller.signal,
        );
        if (saved.length > 0) {
          await notifyClaimNotifications(saved, Notifications);
        }
        // Se avisa también en la primera sincronización (saved vacío) para refrescar la bandeja
        listeners.forEach((listener) => listener(saved));
      } catch (error) {
        if (!activo) break;
        console.warn("[novedades] Error consultando reclamos:", error?.message);
        // Si falla (sin red, 401, etc.) esperamos para no reintentar en un loop cerrado
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  escuchar();

  return () => {
    activo = false;
    controller.abort(); // corta la conexión retenida al desmontar
  };
}
