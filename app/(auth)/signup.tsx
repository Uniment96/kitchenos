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

export default function SignupScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const register = useAuthStore((s) => s.register);
  const showToast = useUIStore((s) => s.showToast);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!displayName.trim() || !email.trim() || !password.trim()) {
      showToast('Please fill in all fields', 'warning'); return;
    }
    if (password !== confirm) {
      showToast('Passwords do not match', 'error'); return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning'); return;
    }
    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password, displayName.trim());
      router.replace('/(admin)');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Set up your restaurant workspace</Text>
          </View>

          <View style={styles.card}>
            <Input label="Your Name" value={displayName} onChangeText={setDisplayName}
              placeholder="e.g. Chef Maria" autoCapitalize="words" returnKeyType="next" />
            <Input label="Email" value={email} onChangeText={setEmail}
              placeholder="chef@restaurant.com" keyboardType="email-address"
              autoCapitalize="none" returnKeyType="next" />
            <Input label="Password" value={password} onChangeText={setPassword}
              placeholder="Min. 6 characters" secureTextEntry returnKeyType="next" />
            <Input label="Confirm Password" value={confirm} onChangeText={setConfirm}
              placeholder="Re-enter password" secureTextEntry returnKeyType="done"
              onSubmitEditing={handleSignup} />

            <View style={styles.note}>
              <Text style={styles.noteText}>
                You'll be registered as an <Text style={styles.noteAccent}>Admin</Text>.
                Add staff from your dashboard after signing in.
              </Text>
            </View>

            <Button label="Create Account" onPress={handleSignup} loading={loading} style={styles.btn} />
          </View>

          <TouchableOpacity onPress={() => router.back()} style={styles.link}>
            <Text style={styles.linkText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  header: { alignItems: 'center', marginBottom: Spacing.lg },
  logo: { fontSize: 48, marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '900', color: COLORS.textLight },
  subtitle: { fontSize: FontSize.sm, color: COLORS.accent, fontWeight: '600', marginTop: 4 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.lg,
  },
  note: { marginTop: Spacing.md, backgroundColor: COLORS.accent + '12', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: COLORS.accent + '30' },
  noteText: { fontSize: FontSize.sm, color: COLORS.textSecondary, lineHeight: 20 },
  noteAccent: { color: COLORS.accent, fontWeight: '700' },
  btn: { marginTop: Spacing.md },
  link: { alignItems: 'center', paddingVertical: Spacing.sm },
  linkText: { color: COLORS.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
});
