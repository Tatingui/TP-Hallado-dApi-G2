import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { database } from './src/database';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { useAuth } from './src/hooks/useAuth';
import { startSyncCoordinator } from './src/sync/syncCoordinator';
import AppNavigator from './src/navigation/AppNavigator';

function GlobalOfflineSyncWatcher({ children }) {
  const { token, user, loading } = useAuth();
  useEffect(() => {
    if (token && user && !loading) return startSyncCoordinator();
  }, [token, user, loading]);
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
