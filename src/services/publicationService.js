import { apiGet } from "./api";
import { getToken } from "../storage/authStorage";

/**
 * Busca publicaciones en el backend.
 * Arma los query params y usa apiGet (fetch).
 */
export const searchPublicationsApi = async ({
  type,
  category,
  query,
  barrio,
  dateFilter,
  startDate,
  endDate,
  lat,
  lng,
  sortBy = "recent",
  page = 0,
  size = 10,
}) => {
  const params = new URLSearchParams();

  if (type) params.append("type", type);
  if (category) params.append("category", category);
  if (query && query.trim()) params.append("query", query.trim());
  if (barrio && barrio !== "Todos los barrios") params.append("barrio", barrio);
  if (dateFilter && dateFilter !== "ALL") params.append("dateFilter", dateFilter);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (lat != null) params.append("lat", String(lat));
  if (lng != null) params.append("lng", String(lng));
  if (sortBy) params.append("sortBy", sortBy);
  params.append("page", String(page));
  params.append("size", String(size));

  const token = await getToken();
  const data = await apiGet(`/publications/search?${params.toString()}`, token);
  return data;
};
