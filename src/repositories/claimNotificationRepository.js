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
  if (claim?.meetingStatus === "PROPOSED") {
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
    ACCEPTED: ["CLAIM_ACCEPTED", "Reclamo aceptado", "Tu reclamo fue aceptado."],
    REJECTED: ["CLAIM_REJECTED", "Reclamo rechazado", "Tu reclamo fue rechazado."],
    CANCELLED: ["CLAIM_CANCELLED", "Reclamo cancelado", "El reclamo fue cancelado."],
    EXPIRED: ["CLAIM_EXPIRED", "Reclamo vencido", "El reclamo venció."],
  };
  const status = statusText[claim?.status];
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

export async function fetchAndSaveClaimNotifications(token, session = peekDatabaseSession()) {
  if (!token || !session) return [];

  const storedSince = await readLocal("novedades_ultima_fecha", null, session);
  const since = storedSince || "1970-01-01T00:00:00";
  const response = await fetch(
    `${API_URL}/novedades?ultimaFecha=${encodeURIComponent(since)}`,
    { headers: { Authorization: `Bearer ${token}` } },
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
  await writeLocal(
    "novedades_ultima_fecha",
    new Date().toISOString().replace("Z", ""),
    session,
  );
  return saved;
}

export function getClaimNotificationNavigation(notification) {
  const tab = notification?.type === "CLAIM_RECEIVED"
    || notification?.type === "MEETING_POINT_PROPOSED"
    ? "received"
    : "sent";
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
