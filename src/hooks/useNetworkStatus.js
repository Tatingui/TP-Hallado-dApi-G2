import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { API_URL } from '../constants/apiConfig';

export async function checkNetworkConnection() {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try { return (await fetch(API_URL + '/health', { signal: controller.signal })).ok; }
  catch { return false; }
  finally { clearTimeout(timer); }
}
export function useNetworkStatus() {
  // Arranca como conectado: si arrancara en false, cada pantalla mostraría por un
  // instante el aviso "Sin conexión" hasta que NetInfo informe el estado real.
  const [isConnected, setIsConnected] = useState(true);
  useEffect(() => NetInfo.addEventListener(state => setIsConnected(state.isConnected !== false)), []);
  return { isConnected };
}
