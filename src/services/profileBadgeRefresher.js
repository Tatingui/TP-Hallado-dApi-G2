import { AppState } from "react-native";
import { getFollowedUpdatesCountApi } from "./publicationService";
import { getMyAlertsApi } from "./alertService";
import { setProfileTabBadge } from "../storage/profileTabBadge";

// Punto 9: el badge de la pestaña Perfil indica que hay novedades en publicaciones
// seguidas (cambios de estado) o publicaciones nuevas en búsquedas guardadas.
// Se recalcula periódicamente y al volver la app a primer plano, sin tener que
// entrar al Perfil. No dispara notificaciones: solo prende o apaga el badge.

const REFRESH_INTERVAL_MS = 30000;

/**
 * Consulta al backend y actualiza el badge. Devuelve los contadores usados.
 * shouldApply permite descartar la respuesta si mientras tanto se cerró la sesión.
 */
export async function refreshProfileTabBadge(shouldApply = () => true) {
  const [updates, alerts] = await Promise.all([
    getFollowedUpdatesCountApi().catch(() => null),
    getMyAlertsApi().catch(() => null),
  ]);
  // Si fallaron las dos consultas (sin red, etc.) se deja el badge como estaba
  if (updates == null && alerts == null) return null;

  const followedUpdates = updates?.count || 0;
  const alertsNew = (alerts || []).reduce(
    (sum, alert) => sum + (alert?.active ? alert.newCount || 0 : 0),
    0,
  );
  if (shouldApply()) setProfileTabBadge(followedUpdates > 0 || alertsNew > 0);
  return { followedUpdates, alertsNew };
}

/** Inicia el refresco periódico del badge. Devuelve la función de cleanup. */
export function startProfileBadgeWatcher() {
  let active = true;
  const run = () => {
    if (!active || AppState.currentState !== "active") return;
    refreshProfileTabBadge(() => active).catch((error) =>
      console.warn("[badge] No se pudo actualizar el badge del perfil:", error?.message),
    );
  };

  const timer = setInterval(run, REFRESH_INTERVAL_MS);
  const foreground = AppState.addEventListener("change", (state) => {
    if (state === "active") run();
  });
  run();

  return () => {
    active = false;
    clearInterval(timer);
    foreground.remove();
    setProfileTabBadge(false); // al cerrar sesión no queda el badge del usuario anterior
  };
}
