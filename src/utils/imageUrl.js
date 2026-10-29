import { IMAGE_BASE_URL } from '../services/api';

/**
 * Resuelve una URL de imagen del backend a una URL absoluta.
 * Maneja URLs relativas (/uploads/...), absolutas (http://...), locales (file://) y data URIs.
 *
 * @param {string|null|undefined} url
 * @returns {string|null}
 */
export function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('file://') || url.startsWith('data:')) {
    return url;
  }
  return `${IMAGE_BASE_URL}${url}`;
}
