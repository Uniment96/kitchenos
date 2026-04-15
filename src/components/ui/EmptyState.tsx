import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FontSize, Spacing } from '../../constants/theme';

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ icon = '📭', title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  icon: { fontSize: 52, marginBottom: Spacing.md },
  title: { fontSize: FontSize.lg, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: FontSize.sm, color: COLORS.textSecondary, textAlign: 'center', marginTop: 6 },
});
