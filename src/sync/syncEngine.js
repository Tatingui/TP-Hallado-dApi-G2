// La inyección de dependencias permite probar las reglas de concurrencia y reintentos sin el runtime nativo.
export function createSyncEngine({ getSession, isCurrent, isOnline, list, send, complete, fail, now = Date.now }) {
  let running = null;
  return function sync() {
    if (running) return running;
    // Se difiere el trabajo para que el lock quede tomado antes de la primera operación asíncrona.
    running = Promise.resolve().then(async () => {
      const session = getSession();
      if (!session || !(await isOnline()) || !isCurrent(session)) return 0;
      let count = 0;
      for (const op of await list(session)) {
        if (!isCurrent(session)) break;
        if (op.state === 'blocked' || op.nextAttemptAt > now()) continue;
        try {
          if (op.operationType !== 'CREATE_PUBLICATION') {
            await fail(op, { state: 'blocked', message: 'Esta acción requiere conexión y no se puede encolar.' }, session);
            continue;
          }
          const result = await send(op, session);
          if (!isCurrent(session)) break;
          await complete(op, result, session);
          count += 1;
        } catch (error) {
          if (!isCurrent(session) || error.status === 401) break;
          const blocked = error.status >= 400 && error.status < 500 && ![408, 429].includes(error.status);
          await fail(op, {
            state: blocked ? 'blocked' : 'pending',
            message: error.message || 'No se pudo enviar. Se reintentará sin perder los datos.',
            nextAttemptAt: now() + Math.min(300000, 2000 * 2 ** Math.min(op.retryCount, 8)),
          }, session);
        }
      }
      return count;
    }).finally(() => { running = null; });
    return running;
  };
}
