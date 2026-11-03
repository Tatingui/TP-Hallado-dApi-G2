import { useCallback, useEffect, useState } from "react";

/**
 * Cuenta regresiva en segundos. Se usa, por ejemplo, para habilitar
 * el reenvío de un código recién cuando pasa el tiempo de espera.
 */
export function useCountdown(seconds) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return undefined;
    const timer = setTimeout(() => setRemaining((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  const restart = useCallback(() => setRemaining(seconds), [seconds]);

  return { remaining, isRunning: remaining > 0, restart };
}
