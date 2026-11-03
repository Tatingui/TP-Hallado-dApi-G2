// Cada sesión tiene una generación: al cambiar de cuenta se invalidan las lecturas y escrituras en curso.
let session = null;
let generation = 0;
const listeners = new Set();

export function setDatabaseSession(owner, token) {
  generation += 1;
  session = owner && token ? { owner: owner.trim().toLowerCase(), token, generation, ready: false } : null;
  listeners.forEach((listener) => listener());
}

export function getDatabaseSession() {
  if (!session) throw new Error('Iniciá sesión para acceder a los datos locales.');
  return session;
}

/**
 * Devuelve la sesión actual o null, sin lanzar error. Sirve para los efectos
 * que pueden volver a ejecutarse mientras se cierra la sesión.
 */
export function peekDatabaseSession() {
  return session;
}

export function isCurrentSession(captured) {
  return Boolean(session && captured && session.generation === captured.generation);
}

export function assertCurrentSession(captured) {
  if (!isCurrentSession(captured)) {
    const error = new Error('La sesión cambió.');
    error.code = 'SESSION_CHANGED';
    throw error;
  }
}

export function subscribeSession(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function markDatabaseReady(captured = getDatabaseSession()) {
  assertCurrentSession(captured);
  session.ready = true;
}
