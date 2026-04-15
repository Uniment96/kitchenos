import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FontSize, Spacing, Radius, Shadow } from '../../constants/theme';
import type { Recipe } from '../../types';

interface Props {
  recipe: Recipe;
  onPress: () => void;
}

export default function RecipeCard({ recipe, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{recipe.name}</Text>
          {recipe.category && <Text style={styles.category}>{recipe.category}</Text>}
          <Text style={styles.yield}>
            Base yield: {recipe.baseYield} {recipe.yieldUnit}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeNum}>{recipe.ingredients.length}</Text>
          <Text style={styles.badgeLabel}>ing.</Text>
        </View>
      </View>
      {recipe.description ? (
        <Text style={styles.desc} numberOfLines={2}>{recipe.description}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  info: { flex: 1, marginRight: Spacing.sm },
  name: { fontSize: FontSize.lg, fontWeight: '800', color: COLORS.textPrimary },
  category: { fontSize: FontSize.xs, color: COLORS.accent, fontWeight: '700', marginTop: 2 },
  yield: { fontSize: FontSize.sm, color: COLORS.textSecondary, marginTop: 4 },
  desc: { fontSize: FontSize.sm, color: COLORS.textSecondary, marginTop: 8, lineHeight: 18 },
  badge: {
    backgroundColor: COLORS.accent + '18',
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  badgeNum: { fontSize: FontSize.xl, fontWeight: '900', color: COLORS.accent },
  badgeLabel: { fontSize: FontSize.xs, color: COLORS.accent, fontWeight: '700' },
});
