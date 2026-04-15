import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useRecipeStore } from '@/store/recipeStore';
import RecipeCard from '@/components/recipe/RecipeCard';
import EmptyState from '@/components/ui/EmptyState';
import { COLORS, Spacing, FontSize } from '@/constants/theme';

export default function StaffRecipes() {
  const profile = useAuthStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);
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
        <View>
          <Text style={styles.title}>Recipes</Text>
          <Text style={styles.sub}>Hi, {profile?.displayName?.split(' ')[0]}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
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
          <RecipeCard recipe={item} onPress={() => router.push(`/(staff)/recipe/${item.id}`)} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="📖"
              title={search ? 'No recipes match' : 'No recipes yet'}
              subtitle="Your admin will add recipes for you"
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, backgroundColor: COLORS.primary },
  title: { fontSize: FontSize.xl, fontWeight: '900', color: '#fff' },
  sub: { color: 'rgba(255,255,255,0.6)', fontSize: FontSize.sm, marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  searchWrap: { padding: Spacing.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  search: { backgroundColor: COLORS.surfaceAlt, borderRadius: 12, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: FontSize.md, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  list: { padding: Spacing.md, flexGrow: 1 },
});
