import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FontSize, Spacing, Radius } from '../../constants/theme';
import { formatQty } from '../../utils/scalingEngine';
import type { ScaledIngredient } from '../../utils/scalingEngine';
import type { RecipeIngredient } from '../../types';

interface Props {
  ingredient: RecipeIngredient | ScaledIngredient;
  showScaled?: boolean;
}

function isScaled(i: RecipeIngredient | ScaledIngredient): i is ScaledIngredient {
  return 'scaledQuantity' in i;
}

export default function IngredientRow({ ingredient, showScaled }: Props) {
  const scaled = showScaled && isScaled(ingredient);
  return (
    <View style={styles.row}>
      <Text style={styles.name}>{ingredient.ingredientName}</Text>
      <View style={styles.qty}>
        {scaled && isScaled(ingredient) ? (
          <>
            <Text style={styles.scaledQty}>{formatQty(ingredient.scaledQuantity)}</Text>
            <Text style={styles.unit}> {ingredient.unit}</Text>
          </>
        ) : (
          <>
            <Text style={styles.baseQty}>{formatQty(ingredient.quantity)}</Text>
            <Text style={styles.unit}> {ingredient.unit}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  name: { flex: 1, fontSize: FontSize.md, color: COLORS.textPrimary },
  qty: { flexDirection: 'row', alignItems: 'baseline' },
  baseQty: { fontSize: FontSize.md, fontWeight: '700', color: COLORS.textPrimary },
  scaledQty: { fontSize: FontSize.lg, fontWeight: '900', color: COLORS.accent },
  unit: { fontSize: FontSize.sm, color: COLORS.textSecondary },
});
