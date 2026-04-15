import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useStaffStore } from '@/store/staffStore';
import EmptyState from '@/components/ui/EmptyState';
import { COLORS, Spacing, FontSize, Radius, Shadow } from '@/constants/theme';

export default function StaffScreen() {
  const profile = useAuthStore((s) => s.profile);
  const { staff, loading, load, removeStaff } = useStaffStore();

  useEffect(() => {
    if (profile?.uid) load(profile.uid);
  }, [profile?.uid]);

  const confirmRemove = (uid: string, name: string) => {
    Alert.alert('Remove Staff', `Remove ${name} from your workspace?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeStaff(uid) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Staff ({staff.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(admin)/add-staff')}>
          <Text style={styles.addBtnText}>+ Add Staff</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={staff}
        keyExtractor={(m) => m.uid}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.displayName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.displayName}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
            <TouchableOpacity onPress={() => confirmRemove(item.uid, item.displayName)} style={styles.removeBtn}>
              <Text style={styles.removeTxt}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={loading ? null : (
          <EmptyState icon="👥" title="No staff yet" subtitle="Tap + Add Staff to create accounts for your team" />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surfaceAlt },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, backgroundColor: COLORS.primary },
  title: { fontSize: FontSize.xl, fontWeight: '900', color: '#fff' },
  addBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.sm },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.sm },
  list: { padding: Spacing.md, flexGrow: 1 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  avatarText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '900' },
  info: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: '700', color: COLORS.textPrimary },
  email: { fontSize: FontSize.xs, color: COLORS.textSecondary, marginTop: 2 },
  removeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.sm, borderWidth: 1, borderColor: COLORS.error },
  removeTxt: { color: COLORS.error, fontSize: FontSize.xs, fontWeight: '700' },
});
