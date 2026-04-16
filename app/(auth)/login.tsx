import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { COLORS, Spacing, FontSize, Radius, Shadow } from '@/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const showToast = useUIStore((s) => s.showToast);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showToast('Please enter email and password', 'warning');
      return;
    }
    setLoading(true);
    try {
      const profile = await login(email.trim().toLowerCase(), password);
      router.replace(profile.role === 'admin' ? '/(admin)' : '/(staff)');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>🍳</Text>
            <Text style={styles.title}>KitchenOS</Text>
            <Text style={styles.subtitle}>Recipe management for your kitchen</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="chef@restaurant.com"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <Button label="Sign In" onPress={handleLogin} loading={loading} style={styles.btn} />
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={styles.link}>
            <Text style={styles.linkText}>New restaurant? Create admin account</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Staff — contact your admin for login credentials</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: { fontSize: 64, marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxxl, fontWeight: '900', color: COLORS.textLight, letterSpacing: 0.5 },
  subtitle: { fontSize: FontSize.sm, color: COLORS.accent, fontWeight: '600', marginTop: 4 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.lg,
  },
  cardTitle: { fontSize: FontSize.xl, fontWeight: '800', color: COLORS.textPrimary, marginBottom: Spacing.md, textAlign: 'center' },
  btn: { marginTop: Spacing.md },
  link: { alignItems: 'center', paddingVertical: Spacing.sm },
  linkText: { color: COLORS.accent, fontSize: FontSize.sm, fontWeight: '600' },
  hint: { color: COLORS.textSecondary, textAlign: 'center', fontSize: FontSize.xs, marginTop: 4 },
});
