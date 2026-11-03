import { authDelete, authGet, authPost, authPut } from "./api";
import { PublicationType, getCategoryLabel } from "../constants/publicationConstants";

/**
 * Punto 9: Guarda la búsqueda actual del buscador como alerta.
 * Solo se guardan los criterios que pide la consigna: tipo, categoría, barrio y palabras clave.
 */
export const createAlertApi = async (searchCriteria, tokenParam) => {
  const alert = {
    type: searchCriteria.type,
    category: searchCriteria.category || null,
    barrio: searchCriteria.barrio || null,
    query: searchCriteria.query || null,
  };
  return authPost("/alerts", alert, tokenParam);
};

/**
 * Punto 9: Mis alertas, cada una con la cantidad de publicaciones nuevas (newCount).
 */
export const getMyAlertsApi = async (tokenParam) => {
  return authGet("/alerts", tokenParam);
};

/**
 * Punto 9: Publicaciones que coinciden con la alerta. Las nuevas vienen con hasNewUpdates = true.
 */
export const getAlertPublicationsApi = async (alertId, page = 0, size = 10, tokenParam) => {
  return authGet(`/alerts/${alertId}/publications?page=${page}&size=${size}`, tokenParam);
};

export const markAlertAsSeenApi = async (alertId, tokenParam) => {
  return authPost(`/alerts/${alertId}/seen`, {}, tokenParam);
};

/**
 * Punto 9: Pausa (active = false) o reanuda (active = true) una alerta.
 */
export const setAlertActiveApi = async (alertId, active, tokenParam) => {
  return authPut(`/alerts/${alertId}/active`, { active }, tokenParam);
};

export const deleteAlertApi = async (alertId, tokenParam) => {
  return authDelete(`/alerts/${alertId}`, tokenParam);
};

/**
 * Texto corto con los criterios de la alerta, ej: Hallazgos • Llaves • en Palermo • "azul"
 */
export const getAlertSummary = (alert) =>
  [
    alert.type === PublicationType.LOST ? "Hallazgos" : "Pérdidas",
    alert.category ? getCategoryLabel(alert.category) : null,
    alert.barrio ? `en ${alert.barrio}` : null,
    alert.query ? `"${alert.query}"` : null,
  ]
    .filter(Boolean)
    .join(" • ");
