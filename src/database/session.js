// A generation invalidates in-flight reads/writes when the active account changes.
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
