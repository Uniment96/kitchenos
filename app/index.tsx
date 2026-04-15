import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function Index() {
  const profile = useAuthStore((s) => s.profile);
  const loading = useAuthStore((s) => s.loading);

  if (loading) return <LoadingScreen message="Loading KitchenOS..." />;
  if (!profile) return <Redirect href="/(auth)/login" />;
  if (profile.role === 'admin') return <Redirect href="/(admin)" />;
  return <Redirect href="/(staff)" />;
}
