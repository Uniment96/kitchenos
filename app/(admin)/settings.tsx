import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { COLORS, Spacing, FontSize, Radius, Shadow } from '@/constants/theme';

export default function SettingsScreen() {
  const profile = useAuthStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(profile?.displayName ?? 'A').charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{profile?.displayName}</Text>
            <Text style={styles.profileEmail}>{profile?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Admin</Text>
            </View>
          </View>
        </View>

        {/* Info rows */}
        <View style={styles.section}>
          <InfoRow label="Workspace ID" value={(profile?.ownerId?.slice(0, 12) ?? '—') + '...'} />
          <InfoRow label="Role" value="Admin" />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surfaceAlt },
  header: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, backgroundColor: COLORS.primary },
  title: { fontSize: FontSize.xl, fontWeight: '900', color: '#fff' },
  content: { padding: Spacing.md },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm, gap: Spacing.md },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: FontSize.xxl, fontWeight: '900' },
  profileName: { fontSize: FontSize.lg, fontWeight: '800', color: COLORS.textPrimary },
  profileEmail: { fontSize: FontSize.sm, color: COLORS.textSecondary, marginTop: 2 },
  roleBadge: { marginTop: 6, backgroundColor: COLORS.accent + '18', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  roleText: { color: COLORS.accent, fontSize: FontSize.xs, fontWeight: '800' },
  section: { backgroundColor: COLORS.surface, borderRadius: Radius.md, marginBottom: Spacing.lg, ...Shadow.sm },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  infoLabel: { fontSize: FontSize.md, color: COLORS.textSecondary },
  infoValue: { fontSize: FontSize.md, color: COLORS.textPrimary, fontWeight: '600' },
  logoutBtn: { backgroundColor: COLORS.error, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: FontSize.md, fontWeight: '800' },
});
