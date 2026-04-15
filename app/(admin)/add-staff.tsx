import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useStaffStore } from '@/store/staffStore';
import { useUIStore } from '@/store/uiStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { COLORS, Spacing, FontSize, Radius } from '@/constants/theme';

export default function AddStaffScreen() {
  const profile = useAuthStore((s) => s.profile);
  const { addStaff, loading } = useStaffStore();
  const showToast = useUIStore((s) => s.showToast);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAdd = async () => {
    if (!displayName.trim() || !email.trim() || !password.trim()) {
      showToast('All fields are required', 'warning'); return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning'); return;
    }
    try {
      await addStaff(profile!.uid, email.trim().toLowerCase(), password, displayName.trim());
      showToast(`${displayName} added to your team`, 'success');
      router.back();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add staff';
      showToast(msg, 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Staff</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.note}>
          <Text style={styles.noteText}>
            A Firebase account will be created for this staff member. Share the email
            and password with them so they can sign in.
          </Text>
        </View>

        <Input label="Full Name" value={displayName} onChangeText={setDisplayName}
          placeholder="e.g. Maria Santos" autoCapitalize="words" returnKeyType="next" />
        <Input label="Email" value={email} onChangeText={setEmail}
          placeholder="staff@restaurant.com" keyboardType="email-address"
          autoCapitalize="none" returnKeyType="next" />
        <Input label="Temporary Password" value={password} onChangeText={setPassword}
          placeholder="Min. 6 characters" secureTextEntry returnKeyType="done"
          onSubmitEditing={handleAdd} />

        <Button label="Create Staff Account" onPress={handleAdd} loading={loading} style={styles.saveBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, backgroundColor: COLORS.primary },
  backBtn: { color: '#fff', fontSize: FontSize.md, fontWeight: '600' },
  title: { fontSize: FontSize.xl, fontWeight: '900', color: '#fff' },
  scroll: { padding: Spacing.md },
  note: { backgroundColor: COLORS.info + '18', borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: COLORS.info + '40' },
  noteText: { fontSize: FontSize.sm, color: COLORS.textSecondary, lineHeight: 20 },
  saveBtn: { marginTop: Spacing.xl },
});
