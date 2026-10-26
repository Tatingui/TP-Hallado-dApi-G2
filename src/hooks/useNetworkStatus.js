import { useState, useEffect, useCallback } from 'react';

/**
 * Realiza un chequeo rápido de conectividad mediante un fetch liviano con timeout.
 * @returns {Promise<boolean>} true si hay conexión, false en caso contrario.
 */
export async function checkNetworkConnection() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // Intentamos alcanzar el endpoint de salud o un ping rápido
    const response = await fetch('https://clients3.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);
    return response.ok || response.status === 204;
  } catch (error) {
    // Si falla el ping externo, probamos alcance básico o consideramos offline
    return false;
  }
}

/**
 * Hook personalizado para monitorear el estado de la conexión a internet.
 */
export function useNetworkStatus(pollInterval = 10000) {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    const connected = await checkNetworkConnection();
    setIsConnected(connected);
    setIsChecking(false);
    return connected;
  }, []);

  useEffect(() => {
    // Chequeo inicial
    checkConnection();

    // Verificación periódica
    const interval = setInterval(() => {
      checkConnection();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [checkConnection, pollInterval]);

  return {
    isConnected,
    isChecking,
    checkConnection,
    setIsConnected,
  };
}
