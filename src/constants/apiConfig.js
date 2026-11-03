export function sanitizeApiUrl(rawUrl) {
  if (typeof rawUrl !== 'string') return 'http://10.0.2.2:8081/api';
  const trimmed = rawUrl.trim();
  if (!trimmed) return 'http://10.0.2.2:8081/api';
  return trimmed.replace(/\/+$/, '');
}

export const API_URL = sanitizeApiUrl(process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8081/api');
