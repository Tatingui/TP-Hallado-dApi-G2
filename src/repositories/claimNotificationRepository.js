import { Q } from "@nozbe/watermelondb";
import { database } from "../database";
import {
  assertCurrentSession,
  getDatabaseSession,
  peekDatabaseSession,
} from "../database/session";
import { readLocal, writeLocal } from "../database/localStore";
import { API_URL } from "../constants/apiConfig";

function getNotificationText(claim) {
  // El backend indica qué le pasó a ESTA persona (novedadTipo), según su rol en el reclamo.
  // Así el publicador no recibe "Tu reclamo fue rechazado" por algo que hizo él mismo.
  const tipo = claim?.novedadTipo;
  if (tipo === "MEETING_POINT_PROPOSED") {
    return {
      type: "MEETING_POINT_PROPOSED",
      title: "Punto de encuentro actualizado",
      message: claim.meetingAddress
        ? `Se propone: ${claim.meetingAddress}`
        : "La otra parte modificó el punto de encuentro.",
    };
  }

  const statusText = {
    PENDING: ["CLAIM_RECEIVED", "Nuevo reclamo recibido", "Recibiste un reclamo nuevo."],
    RECEIVED: ["CLAIM_RECEIVED", "Nuevo reclamo recibido", "Recibiste un reclamo nuevo."],
    ACCEPTED: ["CLAIM_ACCEPTED", "Reclamo aceptado", "Tu reclamo fue aceptado."],
    REJECTED: ["CLAIM_REJECTED", "Reclamo rechazado", "Tu reclamo fue rechazado."],
    CANCELLED: ["CLAIM_CANCELLED", "Reclamo cancelado", "El reclamo fue cancelado."],
    EXPIRED: ["CLAIM_EXPIRED", "Reclamo vencido", "El reclamo venció."],
  };
  const status = statusText[tipo?.replace("CLAIM_", "") || claim?.status];
  if (status) {
    return { type: status[0], title: status[1], message: status[2] };
  }

  return {
    type: "CLAIM_UPDATE",
    title: "Actualización del reclamo",
    message: "Cambió el estado de uno de tus reclamos.",
  };
}

export async function getClaimNotifications(session = getDatabaseSession()) {
  const rows = await database
    .get("claim_notifications")
    .query(
      Q.where("owner", session.owner),
      Q.sortBy("received_at", Q.desc),
    )
    .fetch();
  assertCurrentSession(session);

  return rows.map((row) => ({
    id: row.id,
    claimId: row.claimId,
    publicationId: row.publicationId,
    type: row.type,
    eventKey: row.eventKey,
    title: row.title,
    message: row.message,
    payloadJson: row.payloadJson,
    receivedAt: row.receivedAt,
    readAt: row.readAt,
  }));
}

export async function saveClaimNotifications(items, session = getDatabaseSession()) {
  if (!Array.isArray(items) || items.length === 0) return [];

  return database.write(async () => {
    assertCurrentSession(session);
    const collection = database.get("claim_notifications");
    const saved = [];
    const receivedAt = new Date();

    for (const claim of items) {
      if (!claim?.id) continue;
      const text = getNotificationText(claim);
      const eventKey = [
        claim.id,
        text.type,
        claim.status || "",
        claim.meetingStatus || "",
        claim.meetingAddress || "",
        claim.claimDate || "",
      ].join("|");

      const existing = await collection
        .query(
          Q.where("owner", session.owner),
          Q.where("event_key", eventKey),
        )
        .fetch();
      if (existing.length > 0) continue;

      const row = await collection.create((notification) => {
        notification.owner = session.owner;
        notification.claimId = claim.id;
        notification.publicationId = claim.publicationId ?? null;
        notification.type = text.type;
        notification.eventKey = eventKey;
        notification.title = text.title;
        notification.message = text.message;
        notification.payloadJson = JSON.stringify(claim);
        notification.receivedAt = receivedAt;
        notification.readAt = null;
      });
      saved.push(row);
    }

    assertCurrentSession(session);
    return saved;
  });
}

// El cursor es la `fecha` que informa el SERVIDOR (no el reloj ni la zona horaria del
// teléfono). La clave es nueva: la vieja guardaba la hora del teléfono en UTC, que
// quedaba por delante de la hora del servidor y ocultaba todas las novedades.
const CURSOR_KEY = "novedades_ultima_fecha_servidor";

/**
 * Una única consulta (long polling) a /novedades. El servidor retiene la respuesta hasta
 * 25 s; si no hay novedades responde 204.
 * Devuelve las novedades NUEVAS guardadas en la bandeja, para que quien llama las notifique.
 * En la primera sincronización se guarda el historial pero no se devuelve, para no
 * disparar una notificación por cada reclamo viejo.
 */
export async function fetchAndSaveClaimNotifications(
  token,
  session = peekDatabaseSession(),
  signal,
) {
  if (!token || !session) return [];

  const storedSince = await readLocal(CURSOR_KEY, null, session);
  const since = storedSince || "1970-01-01T00:00:00";
  const response = await fetch(
    `${API_URL}/novedades?ultimaFecha=${encodeURIComponent(since)}`,
    { headers: { Authorization: `Bearer ${token}` }, signal },
  );

  if (!response.ok) {
    const error = new Error(`El servidor respondió ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return [];
  const novedades = await response.json();
  if (!Array.isArray(novedades) || novedades.length === 0) return [];

  const saved = await saveClaimNotifications(novedades, session);
  const ultimaFecha = novedades
    .map((novedad) => novedad.fecha)
    .filter(Boolean)
    .sort()
    .pop();
  if (ultimaFecha) await writeLocal(CURSOR_KEY, ultimaFecha, session);
  return storedSince ? saved : [];
}

/** Dispara la notificación local de cada novedad guardada (se ve aun con la app cerrada o en segundo plano). */
export async function notifyClaimNotifications(saved, Notifications) {
  for (const notification of saved) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.message,
        data: getClaimNotificationNavigation(notification),
      },
      trigger: null,
    });
  }
}

export function getClaimNotificationNavigation(notification) {
  // La pestaña depende del rol de quien recibe: publicador → Recibidos, quien reclama → Enviados.
  // El rol viene en el reclamo guardado (payloadJson); si no está (novedades viejas), se infiere del tipo.
  let esPublicador;
  try {
    const payload = notification?.payloadJson ? JSON.parse(notification.payloadJson) : null;
    if (typeof payload?.publicador === "boolean") esPublicador = payload.publicador;
  } catch {
    // payload inválido: se usa el tipo
  }
  if (esPublicador === undefined) esPublicador = notification?.type === "CLAIM_RECEIVED";
  const tab = esPublicador ? "received" : "sent";
  return {
    tab,
    claimId: notification?.claimId != null ? String(notification.claimId) : null,
  };
}

export async function markClaimNotificationAsRead(notificationId, session = getDatabaseSession()) {
  const notification = await database.get("claim_notifications").find(notificationId);
  if (notification.owner !== session.owner) return null;

  return database.write(async () => {
    assertCurrentSession(session);
    await notification.update((row) => {
      row.readAt = row.readAt || new Date();
    });
    return notification;
  });
}

export async function markAllClaimNotificationsAsRead(session = getDatabaseSession()) {
  const rows = await database
    .get("claim_notifications")
    .query(Q.where("owner", session.owner))
    .fetch();
  const unreadRows = rows.filter((row) => !row.readAt);

  if (unreadRows.length === 0) return 0;

  await database.write(async () => {
    assertCurrentSession(session);
    await Promise.all(unreadRows.map((row) =>
      row.update((item) => {
        item.readAt = item.readAt || new Date();
      }),
    ));
  });

  return unreadRows.length;
}
