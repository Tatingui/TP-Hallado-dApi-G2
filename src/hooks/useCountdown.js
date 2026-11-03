import { useCallback, useEffect, useState } from "react";

/**
 * Cuenta regresiva en segundos. Se usa, por ejemplo, para habilitar
 * el reenvío de un código recién cuando pasa el tiempo de espera.
 */
export function useCountdown(initialSeconds = 0) {
  const safeInitial = Math.max(0, Number(initialSeconds) || 0);
  const [remaining, setRemaining] = useState(safeInitial);

  useEffect(() => {
    if (remaining <= 0) return undefined;
    const timer = setTimeout(() => setRemaining((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  const restart = useCallback((newSeconds) => {
    const target = newSeconds !== undefined ? Math.max(0, Number(newSeconds) || 0) : safeInitial;
    setRemaining(target);
  }, [safeInitial]);

  return { remaining, isRunning: remaining > 0, restart };
}
