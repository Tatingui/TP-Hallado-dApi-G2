import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../context/AuthContext";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { syncPendingPublications } from "../services/offlineSyncService";

function GlobalOfflineSyncWatcher({ children }) {
  const { isConnected } = useNetworkStatus(12000);

  useEffect(() => {
    if (isConnected) {
      syncPendingPublications();
    }
  }, [isConnected]);

  return children;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <GlobalOfflineSyncWatcher>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="publication" />
        </Stack>
      </GlobalOfflineSyncWatcher>
    </AuthProvider>
  );
}
