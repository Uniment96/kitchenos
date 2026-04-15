import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useRecipeStore } from '@/store/recipeStore';
import { useUIStore } from '@/store/uiStore';
import IngredientRow from '@/components/recipe/IngredientRow';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { COLORS, Spacing, FontSize, Radius, Shadow } from '@/constants/theme';
import type { Recipe } from '@/types';

export default function AdminRecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useAuthStore((s) => s.profile);
  const { getById, remove } = useRecipeStore();
  const showToast = useUIStore((s) => s.showToast);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (id) getById(id).then(setRecipe);
  }, [id]);

  const handleDelete = () => {
    Alert.alert('Delete Recipe', `Delete "${recipe?.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await remove(profile!.ownerId, id!);
          showToast('Recipe deleted', 'success');
          router.back();
        }
      },
    ]);
  };

  if (!recipe) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteBtn}>Delete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {recipe.category && <Text style={styles.category}>{recipe.category}</Text>}
        <Text style={styles.name}>{recipe.name}</Text>
        {recipe.description && <Text style={styles.desc}>{recipe.description}</Text>}

        {/* Yield info */}
        <View style={styles.yieldCard}>
          <View style={styles.yieldItem}>
            <Text style={styles.yieldValue}>{recipe.baseYield}</Text>
            <Text style={styles.yieldLabel}>Base Yield ({recipe.yieldUnit})</Text>
          </View>
          {recipe.prepTimeMinutes && (
            <View style={styles.yieldItem}>
              <Text style={styles.yieldValue}>{recipe.prepTimeMinutes}</Text>
              <Text style={styles.yieldLabel}>Prep (min)</Text>
            </View>
          )}
          {recipe.cookTimeMinutes && (
            <View style={styles.yieldItem}>
              <Text style={styles.yieldValue}>{recipe.cookTimeMinutes}</Text>
              <Text style={styles.yieldLabel}>Cook (min)</Text>
            </View>
          )}
        </View>

        {/* Ingredients */}
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <View style={styles.ingCard}>
          {recipe.ingredients.map((ing) => (
            <IngredientRow key={ing.ingredientId} ingredient={ing} />
          ))}
        </View>

        {/* Instructions */}
        {recipe.instructions && (
          <>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.instrCard}>
              <Text style={styles.instrText}>{recipe.instructions}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surfaceAlt },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, backgroundColor: COLORS.primary },
  backBtn: { color: '#fff', fontSize: FontSize.md, fontWeight: '600' },
  deleteBtn: { color: COLORS.error, fontSize: FontSize.md, fontWeight: '700' },
  scroll: { padding: Spacing.md },
  category: { fontSize: FontSize.xs, fontWeight: '800', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  name: { fontSize: FontSize.xxl, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 8 },
  desc: { fontSize: FontSize.md, color: COLORS.textSecondary, lineHeight: 22, marginBottom: Spacing.md },
  yieldCard: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm, gap: Spacing.lg },
  yieldItem: { alignItems: 'center' },
  yieldValue: { fontSize: FontSize.xxl, fontWeight: '900', color: COLORS.accent },
  yieldLabel: { fontSize: FontSize.xs, color: COLORS.textSecondary, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: COLORS.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  ingCard: { backgroundColor: COLORS.surface, borderRadius: Radius.md, marginBottom: Spacing.md, ...Shadow.sm, overflow: 'hidden' },
  instrCard: { backgroundColor: COLORS.surface, borderRadius: Radius.md, padding: Spacing.md, ...Shadow.sm, marginBottom: Spacing.xl },
  instrText: { fontSize: FontSize.md, color: COLORS.textPrimary, lineHeight: 24 },
});
