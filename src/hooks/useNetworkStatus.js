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
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => NetInfo.addEventListener(state => setIsConnected(state.isConnected === true)), []);
  return { isConnected, isChecking: false, checkConnection: checkNetworkConnection, setIsConnected };
}
