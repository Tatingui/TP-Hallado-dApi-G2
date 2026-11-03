/**
 * Fechas de la app: un único lugar para convertirlas y mostrarlas.
 *
 * El backend guarda las fechas como LocalDateTime (sin zona horaria). Por eso
 * la app las envía en hora local y sin la "Z" de UTC: si se enviara
 * toISOString(), el servidor guardaría la hora UTC y, al leerla como local,
 * la app la mostraría 3 horas adelantada.
 */

const pad = (number) => String(number).padStart(2, "0");

/** "2026-11-02" según la fecha local (para filtros por día). */
export function toLocalDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Lee "2026-11-02" como medianoche local. new Date("2026-11-02") la toma como
 * medianoche UTC, que en Argentina es el día anterior a las 21:00.
 */
export function fromLocalDateString(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

/** "2026-11-02T21:30:00" en hora local y sin zona, el formato que espera el backend. */
export function toLocalDateTimeString(date) {
  return `${toLocalDateString(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** Convierte lo que devuelve el backend (o un Date) en Date; null si no es válido. */
export function parseDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "02/11/2026" */
export function formatDate(value, fallback = "-") {
  const date = parseDate(value);
  return date ? `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}` : fallback;
}

/** "21:30" */
export function formatTime(value, fallback = "-") {
  const date = parseDate(value);
  return date ? `${pad(date.getHours())}:${pad(date.getMinutes())}` : fallback;
}

/** "02/11/2026 21:30" */
export function formatDateTime(value, fallback = "-") {
  const date = parseDate(value);
  return date ? `${formatDate(date)} ${formatTime(date)}` : fallback;
}
