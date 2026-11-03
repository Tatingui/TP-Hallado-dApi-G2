export const STATUS_METADATA = {
  OPEN: { label: 'Abierta', color: '#1A56DB', badgeVariant: 'info' },
  IN_CLAIM: { label: 'En Reclamo', color: '#F59E0B', badgeVariant: 'warning' },
  RESOLVED: { label: 'Resuelta', color: '#16A34A', badgeVariant: 'success' },
  EXPIRED: { label: 'Vencida', color: '#64748B', badgeVariant: 'neutral' },
  PENDIENTE_ENVIO: { label: 'Pendiente de envío', color: '#D97706', badgeVariant: 'warning' },
};

export const CLAIM_STATUS_METADATA = {
  PENDING: { label: 'Pendiente', color: '#F59E0B', badgeVariant: 'warning' },
  ACCEPTED: { label: 'Aceptado', color: '#16A34A', badgeVariant: 'success' },
  REJECTED: { label: 'Rechazado', color: '#EF4444', badgeVariant: 'danger' },
  EXPIRED: { label: 'Vencido', color: '#6B7280', badgeVariant: 'neutral' },
  CANCELLED: { label: 'Cancelado', color: '#6B7280', badgeVariant: 'neutral' },
};

export function getPublicationStatusMetadata(status) {
  return STATUS_METADATA[status] || { label: status || 'Desconocido', color: '#1E293B', badgeVariant: 'neutral' };
}

export function getClaimStatusMetadata(status) {
  return CLAIM_STATUS_METADATA[status] || { label: status || 'Pendiente', color: '#F59E0B', badgeVariant: 'warning' };
}
