import { apiDelete, apiGet, apiPost, apiPut } from "./api";
import { getToken } from "../storage/authStorage";
import { PublicationType, getCategoryLabel } from "../constants/publicationConstants";

/**
 * Punto 9: Guarda la búsqueda actual del buscador como alerta.
 * Solo se guardan los criterios que pide la consigna: tipo, categoría, barrio y palabras clave.
 */
export const createAlertApi = async (searchCriteria, tokenParam) => {
  const token = tokenParam || (await getToken());
  const alert = {
    type: searchCriteria.type,
    category: searchCriteria.category || null,
    barrio: searchCriteria.barrio || null,
    query: searchCriteria.query || null,
  };
  return apiPost("/alerts", alert, token);
};

/**
 * Punto 9: Mis alertas, cada una con la cantidad de publicaciones nuevas (newCount).
 */
export const getMyAlertsApi = async (tokenParam) => {
  const token = tokenParam || (await getToken());
  return apiGet("/alerts", token);
};

/**
 * Punto 9: Publicaciones que coinciden con la alerta. Las nuevas vienen con hasNewUpdates = true.
 */
export const getAlertPublicationsApi = async (alertId, page = 0, size = 10, tokenParam) => {
  const token = tokenParam || (await getToken());
  return apiGet(`/alerts/${alertId}/publications?page=${page}&size=${size}`, token);
};

export const markAlertAsSeenApi = async (alertId, tokenParam) => {
  const token = tokenParam || (await getToken());
  return apiPost(`/alerts/${alertId}/seen`, {}, token);
};

/**
 * Punto 9: Pausa (active = false) o reanuda (active = true) una alerta.
 */
export const setAlertActiveApi = async (alertId, active, tokenParam) => {
  const token = tokenParam || (await getToken());
  return apiPut(`/alerts/${alertId}/active`, { active }, token);
};

export const deleteAlertApi = async (alertId, tokenParam) => {
  const token = tokenParam || (await getToken());
  return apiDelete(`/alerts/${alertId}`, token);
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
