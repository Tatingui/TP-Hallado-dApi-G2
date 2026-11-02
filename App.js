import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { database } from './src/database';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { syncPendingPublications } from './src/services/offlineSyncService';
import AppNavigator from './src/navigation/AppNavigator';

// Punto 6: al recuperar la conexión se envían las publicaciones pendientes
function GlobalOfflineSyncWatcher({ children }) {
  const { isConnected } = useNetworkStatus(12000);

  useEffect(() => {
    if (isConnected) {
      syncPendingPublications();
    }
  }, [isConnected]);

  return children;
}

export default function App() {
  return (
    <DatabaseProvider database={database}>
    <AuthProvider>
      <GlobalOfflineSyncWatcher>
        <StatusBar style="dark" />
        <AppNavigator />
      </GlobalOfflineSyncWatcher>
    </AuthProvider>
    </DatabaseProvider>
  );
}
