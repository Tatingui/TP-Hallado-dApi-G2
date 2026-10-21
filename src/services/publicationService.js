import api from './api';

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
  const params = {};

  if (type) params.type = type;
  if (category) params.category = category;
  if (query && query.trim()) params.query = query.trim();
  if (barrio && barrio !== 'Todos los barrios') params.barrio = barrio;
  if (dateFilter && dateFilter !== 'ALL') params.dateFilter = dateFilter;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (lat != null) params.lat = lat;
  if (lng != null) params.lng = lng;
  if (sortBy) params.sortBy = sortBy;
  params.page = page;
  params.size = size;

  const response = await api.get('/publications/search', { params });
  return response.data;
};
