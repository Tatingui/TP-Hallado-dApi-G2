import { apiPost } from "./api";
import { getToken } from "../storage/authStorage";

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
