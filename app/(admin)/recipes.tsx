import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useRecipeStore } from '@/store/recipeStore';
import RecipeCard from '@/components/recipe/RecipeCard';
import EmptyState from '@/components/ui/EmptyState';
import { COLORS, Spacing, FontSize, Radius } from '@/constants/theme';

export default function RecipesScreen() {
  const profile = useAuthStore((s) => s.profile);
  const { recipes, loading, load } = useRecipeStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (profile?.ownerId) load(profile.ownerId);
  }, [profile?.ownerId]);

  const filtered = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.category ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipes</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(admin)/add-recipe')}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search recipes..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} onPress={() => router.push(`/(admin)/recipe/${item.id}`)} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="📖"
              title={search ? 'No recipes match' : 'No recipes yet'}
              subtitle={search ? 'Try a different search' : 'Tap + Add to create your first recipe'}
            />
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surfaceAlt },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    backgroundColor: COLORS.primary,
  },
  title: { fontSize: FontSize.xl, fontWeight: '900', color: '#fff' },
  addBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.sm },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.sm },
  searchWrap: { padding: Spacing.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  search: {
    backgroundColor: COLORS.surfaceAlt, borderRadius: Radius.md, paddingHorizontal: Spacing.md,
    paddingVertical: 12, fontSize: FontSize.md, color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border,
  },
  list: { padding: Spacing.md, flexGrow: 1 },
});
