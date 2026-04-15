import React, { useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useRecipeStore } from '@/store/recipeStore';
import { useProductionStore } from '@/store/productionStore';
import { useStaffStore } from '@/store/staffStore';
import { COLORS, Spacing, FontSize, Radius, Shadow } from '@/constants/theme';

export default function AdminDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);
  const recipes = useRecipeStore((s) => s.recipes);
  const logs = useProductionStore((s) => s.logs);
  const staff = useStaffStore((s) => s.staff);

  const loadRecipes = useRecipeStore((s) => s.load);
  const loadLogs = useProductionStore((s) => s.loadAll);
  const loadStaff = useStaffStore((s) => s.load);

  useEffect(() => {
    if (!profile?.ownerId) return;
    loadRecipes(profile.ownerId);
    loadLogs(profile.ownerId);
    loadStaff(profile.ownerId);
  }, [profile?.ownerId]);

  const todayLogs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return logs.filter((l) => l.loggedAt >= today).length;
  }, [logs]);

  const pendingSync = logs.filter((l) => l.syncStatus === 'pending').length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>KitchenOS</Text>
          <Text style={styles.headerSub}>Hi, {profile?.displayName?.split(' ')[0] ?? 'Chef'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard icon="📖" label="Recipes" value={recipes.length} color={COLORS.info} />
          <StatCard icon="👥" label="Staff" value={staff.length} color={COLORS.accent} />
          <StatCard icon="📋" label="Today's Logs" value={todayLogs} color={COLORS.success} />
          <StatCard icon="⏳" label="Pending Sync" value={pendingSync} color={COLORS.warning} />
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actions}>
          <ActionBtn icon="➕" label="New Recipe" onPress={() => router.push('/(admin)/add-recipe')} />
          <ActionBtn icon="👤" label="Add Staff" onPress={() => router.push('/(admin)/add-staff')} />
          <ActionBtn icon="📋" label="All Logs" onPress={() => router.push('/(admin)/ingredients')} />
        </View>

        {/* Recent logs */}
        <Text style={styles.sectionTitle}>Recent Production</Text>
        {logs.slice(0, 5).map((log) => (
          <View key={log.id} style={styles.logRow}>
            <View style={styles.logInfo}>
              <Text style={styles.logRecipe}>{log.recipeName}</Text>
              <Text style={styles.logMeta}>
                {log.requiredYield} {log.yieldUnit} · by {log.loggedByName}
              </Text>
            </View>
            <View style={[styles.syncDot, { backgroundColor: COLORS[log.syncStatus] }]} />
          </View>
        ))}
        {logs.length === 0 && (
          <Text style={styles.empty}>No production logs yet</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionBtn({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.82}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surfaceAlt },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    backgroundColor: COLORS.primary,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900', color: '#fff' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: FontSize.sm, marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.sm },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  scroll: { padding: Spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: COLORS.surface,
    borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center',
    borderTopWidth: 3, ...Shadow.sm,
  },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: FontSize.xxl, fontWeight: '900' },
  statLabel: { fontSize: FontSize.xs, color: COLORS.textSecondary, fontWeight: '700', marginTop: 2 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: COLORS.textPrimary, marginBottom: Spacing.sm },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  actionBtn: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: Radius.md,
    padding: Spacing.md, alignItems: 'center', ...Shadow.sm,
  },
  actionIcon: { fontSize: 28, marginBottom: 6 },
  actionLabel: { fontSize: FontSize.xs, fontWeight: '700', color: COLORS.textPrimary },
  logRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm,
  },
  logInfo: { flex: 1 },
  logRecipe: { fontSize: FontSize.md, fontWeight: '700', color: COLORS.textPrimary },
  logMeta: { fontSize: FontSize.xs, color: COLORS.textSecondary, marginTop: 2 },
  syncDot: { width: 10, height: 10, borderRadius: 5 },
  empty: { color: COLORS.textSecondary, textAlign: 'center', padding: Spacing.xl },
});
