import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useProductionStore } from '@/store/productionStore';
import EmptyState from '@/components/ui/EmptyState';
import { COLORS, Spacing, FontSize, Radius, Shadow } from '@/constants/theme';

export default function MyLogsScreen() {
  const profile = useAuthStore((s) => s.profile);
  const { myLogs, loading, loadMine } = useProductionStore();

  useEffect(() => {
    if (profile?.uid) loadMine(profile.uid);
  }, [profile?.uid]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>My Logs</Text>
      </View>

      <FlatList
        data={myLogs}
        keyExtractor={(l) => l.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.recipeName}>{item.recipeName}</Text>
              <View style={[styles.syncBadge, { backgroundColor: COLORS[item.syncStatus] + '22' }]}>
                <Text style={[styles.syncText, { color: COLORS[item.syncStatus] }]}>
                  {item.syncStatus === 'pending' ? '⏳ Pending' : item.syncStatus === 'synced' ? '✓ Synced' : '✗ Failed'}
                </Text>
              </View>
            </View>
            <Text style={styles.yieldText}>
              {item.requiredYield} {item.yieldUnit} · ×{item.scaleFactor.toFixed(2)} scale
            </Text>
            {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
            <Text style={styles.time}>{item.loggedAt.toLocaleString()}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState icon="📋" title="No logs yet" subtitle="Log a production run from any recipe" />
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surfaceAlt },
  header: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, backgroundColor: COLORS.primary },
  title: { fontSize: FontSize.xl, fontWeight: '900', color: '#fff' },
  list: { padding: Spacing.md, flexGrow: 1 },
  card: { backgroundColor: COLORS.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  recipeName: { flex: 1, fontSize: FontSize.md, fontWeight: '700', color: COLORS.textPrimary, marginRight: 8 },
  syncBadge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  syncText: { fontSize: FontSize.xs, fontWeight: '700' },
  yieldText: { fontSize: FontSize.sm, color: COLORS.textSecondary, marginBottom: 4 },
  notes: { fontSize: FontSize.sm, color: COLORS.textSecondary, fontStyle: 'italic', marginBottom: 4 },
  time: { fontSize: FontSize.xs, color: COLORS.textMuted },
});
