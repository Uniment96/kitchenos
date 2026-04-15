import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { startSyncEngine } from '@/services/sync/syncEngine';
import Toast from '@/components/ui/Toast';
import OfflineBanner from '@/components/ui/OfflineBanner';
import NetInfo from '@react-native-community/netinfo';

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const profile = useAuthStore((s) => s.profile);
  const setOnline = useUIStore((s) => s.setOnline);

  // Boot auth (restores session + wires Firebase listener)
  useEffect(() => {
    const unsubAuth = initialize();
    return unsubAuth;
  }, []);

  // Network status → offline banner + sync
  useEffect(() => {
    const unsubNet = NetInfo.addEventListener((state) => {
      setOnline(!!(state.isConnected && state.isInternetReachable));
    });
    return () => unsubNet();
  }, []);

  // Start sync engine once logged in
  useEffect(() => {
    if (!profile) return;
    const stopSync = startSyncEngine();
    return stopSync;
  }, [profile?.uid]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(staff)" />
      </Stack>
      <OfflineBanner />
      <Toast />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
