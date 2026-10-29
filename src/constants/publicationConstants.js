export const PublicationType = {
  LOST: 'LOST',
  FOUND: 'FOUND',
};

export const CategoryEnum = {
  DOCUMENTS: 'DOCUMENTS',
  KEYS: 'KEYS',
  ELECTRONICS: 'ELECTRONICS',
  PETS: 'PETS',
  CLOTHING: 'CLOTHING',
  OTHERS: 'OTHERS',
};

export const PublicationStatus = {
  OPEN: 'OPEN',
  IN_CLAIM: 'IN_CLAIM',
  RESOLVED: 'RESOLVED',
  EXPIRED: 'EXPIRED',
};

export const DateFilterOption = {
  ALL: 'ALL',
  TODAY: 'TODAY',
  LAST_3_DAYS: 'LAST_3_DAYS',
  LAST_WEEK: 'LAST_WEEK',
  CUSTOM_RANGE: 'CUSTOM_RANGE',
};

export const CATEGORY_OPTIONS = [
  { id: CategoryEnum.PETS, label: 'Mascotas', icon: 'paw' },
  { id: CategoryEnum.KEYS, label: 'Llaves', icon: 'key' },
  { id: CategoryEnum.DOCUMENTS, label: 'Documentos', icon: 'card-account-details' },
  { id: CategoryEnum.ELECTRONICS, label: 'Electrónica', icon: 'cellphone' },
  { id: CategoryEnum.CLOTHING, label: 'Ropa', icon: 'tshirt-crew' },
  { id: CategoryEnum.OTHERS, label: 'Otros', icon: 'dots-horizontal-circle' },
];

export const DATE_FILTER_OPTIONS = [
  { id: DateFilterOption.ALL, label: 'Cualquier fecha' },
  { id: DateFilterOption.TODAY, label: 'Hoy' },
  { id: DateFilterOption.LAST_3_DAYS, label: 'Últimos 3 días' },
  { id: DateFilterOption.LAST_WEEK, label: 'Última semana' },
  { id: DateFilterOption.CUSTOM_RANGE, label: 'Rango de fechas' },
];

export const BARRIOS_LIST = [
  'Todos los barrios',
  'Almagro',
  'Balvanera',
  'Belgrano',
  'Caballito',
  'Colegiales',
  'Flores',
  'La Boca',
  'Nuñez',
  'Palermo',
  'Puerto Madero',
  'Recoleta',
  'San Telmo',
  'Villa Crespo',
  'Villa Urquiza',
];

export const getCategoryLabel = (cat) => {
  const match = CATEGORY_OPTIONS.find((c) => c.id === cat);
  return match ? match.label : cat || 'Otros';
};

export const getCategoryIcon = (cat) => {
  const match = CATEGORY_OPTIONS.find((c) => c.id === cat);
  return match ? match.icon : 'tag';
};

export const getTypeLabel = (type) => {
  if (type === PublicationType.LOST) return 'Objeto / Mascota Perdida';
  if (type === PublicationType.FOUND) return 'Objeto / Mascota Encontrada';
  return type;
};

export const getStatusLabel = (status) => {
  switch (status) {
    case PublicationStatus.OPEN:
      return 'Abierta';
    case PublicationStatus.IN_CLAIM:
      return 'En Reclamo';
    case PublicationStatus.RESOLVED:
      return 'Resuelta';
    case PublicationStatus.EXPIRED:
      return 'Vencida';
    default:
      return status;
  }
};

// --- Colores de estado de publicación ---

export const getPublicationStatusColor = (status) => {
  switch (status) {
    case 'PENDIENTE_ENVIO':
      return '#D97706';
    case PublicationStatus.OPEN:
      return '#1A56DB'; // Colors.primary
    case PublicationStatus.IN_CLAIM:
      return '#F59E0B';
    case PublicationStatus.RESOLVED:
      return '#16A34A'; // Colors.success
    case PublicationStatus.EXPIRED:
      return '#64748B'; // Colors.textSecondary
    default:
      return '#1E293B'; // Colors.text
  }
};

// --- Colores y etiquetas de estado de reclamo ---

export const getClaimStatusColor = (status) => {
  switch (status) {
    case 'ACCEPTED':
      return '#16A34A';
    case 'REJECTED':
      return '#EF4444';
    case 'EXPIRED':
      return '#6B7280';
    case 'PENDING':
    default:
      return '#F59E0B';
  }
};

export const getClaimStatusLabel = (status) => {
  switch (status) {
    case 'ACCEPTED':
      return 'Aceptado';
    case 'REJECTED':
      return 'Rechazado';
    case 'EXPIRED':
      return 'Vencido';
    case 'PENDING':
    default:
      return 'Pendiente';
  }
};
