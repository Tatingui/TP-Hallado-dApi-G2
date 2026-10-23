import { apiGet } from './api';

export const searchPublicationsApi = async ({
  type, // LOST or FOUND
  category,
  query,
  barrio,
  dateFilter,
  startDate,
  endDate,
  lat,
  lng,
  sortBy = 'recent',
  page = 0,
  size = 10,
}) => {
  const queryParams = new URLSearchParams();

  if (type) queryParams.append('type', type);
  if (category) queryParams.append('category', category);
  if (query && query.trim()) queryParams.append('query', query.trim());
  if (barrio && barrio !== 'Todos los barrios') queryParams.append('barrio', barrio);
  if (dateFilter && dateFilter !== 'ALL') queryParams.append('dateFilter', dateFilter);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (lat != null) queryParams.append('lat', lat);
  if (lng != null) queryParams.append('lng', lng);
  if (sortBy) queryParams.append('sortBy', sortBy);
  queryParams.append('page', page.toString());
  queryParams.append('size', size.toString());

  const queryString = queryParams.toString();
  const endpoint = `/publications/search?${queryString}`;

  const data = await apiGet(endpoint);
  return data;
};

