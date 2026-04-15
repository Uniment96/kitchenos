import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useRecipeStore } from '@/store/recipeStore';
import { useIngredientStore } from '@/store/ingredientStore';
import { useUIStore } from '@/store/uiStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { COLORS, Spacing, FontSize, Radius, Shadow, RECIPE_CATEGORIES } from '@/constants/theme';
import type { RecipeIngredient } from '@/types';

export default function AddRecipeScreen() {
  const profile = useAuthStore((s) => s.profile);
  const { add } = useRecipeStore();
  const ingredients = useIngredientStore((s) => s.ingredients);
  const showToast = useUIStore((s) => s.showToast);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [baseYield, setBaseYield] = useState('');
  const [yieldUnit, setYieldUnit] = useState('portions');
  const [instructions, setInstructions] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [saving, setSaving] = useState(false);
  const [ingModal, setIngModal] = useState(false);
  const [selectedIng, setSelectedIng] = useState<string | null>(null);
  const [ingQty, setIngQty] = useState('');

  const handleAddIngredient = () => {
    if (!selectedIng || !ingQty) return;
    const ing = ingredients.find((i) => i.id === selectedIng);
    if (!ing) return;
    setRecipeIngredients((prev) => [
      ...prev.filter((i) => i.ingredientId !== selectedIng),
      { ingredientId: ing.id, ingredientName: ing.name, quantity: parseFloat(ingQty), unit: ing.unit },
    ]);
    setIngModal(false);
    setSelectedIng(null);
    setIngQty('');
  };

  const handleSave = async () => {
    if (!name.trim()) { showToast('Recipe name is required', 'warning'); return; }
    if (!baseYield || isNaN(parseFloat(baseYield))) { showToast('Valid base yield is required', 'warning'); return; }
    if (recipeIngredients.length === 0) { showToast('Add at least one ingredient', 'warning'); return; }
    setSaving(true);
    try {
      await add(profile!.ownerId, profile!.uid, {
        name: name.trim(),
        description: description.trim() || undefined,
        category: category || undefined,
        baseYield: parseFloat(baseYield),
        yieldUnit: yieldUnit.trim() || 'portions',
        ingredients: recipeIngredients,
        instructions: instructions.trim() || undefined,
      });
      showToast('Recipe saved', 'success');
      router.back();
    } catch {
      showToast('Failed to save recipe', 'error');
    } finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Recipe</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Input label="Recipe Name *" value={name} onChangeText={setName} placeholder="e.g. Tomato Bisque" />
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="Brief description..." multiline numberOfLines={3} />

        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.chips}>
          {RECIPE_CATEGORIES.map((c) => (
            <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipActive]} onPress={() => setCategory(category === c ? '' : c)}>
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.yieldRow}>
          <Input label="Base Yield *" value={baseYield} onChangeText={setBaseYield} placeholder="10" keyboardType="numeric" style={styles.yieldInput} />
          <Input label="Unit" value={yieldUnit} onChangeText={setYieldUnit} placeholder="portions" style={styles.yieldUnitInput} />
        </View>

        {/* Ingredients */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Ingredients ({recipeIngredients.length})</Text>
          <TouchableOpacity style={styles.addIngBtn} onPress={() => setIngModal(true)}>
            <Text style={styles.addIngText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {recipeIngredients.map((ri) => (
          <View key={ri.ingredientId} style={styles.ingRow}>
            <Text style={styles.ingName}>{ri.ingredientName}</Text>
            <Text style={styles.ingQty}>{ri.quantity} {ri.unit}</Text>
            <TouchableOpacity onPress={() => setRecipeIngredients((p) => p.filter((i) => i.ingredientId !== ri.ingredientId))}>
              <Text style={styles.ingRemove}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Input label="Instructions" value={instructions} onChangeText={setInstructions} placeholder="Step by step instructions..." multiline numberOfLines={5} />

        <Button label="Save Recipe" onPress={handleSave} loading={saving} style={styles.saveBtn} />
      </ScrollView>

      {/* Ingredient picker modal */}
      <Modal visible={ingModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pick Ingredient</Text>
            <TouchableOpacity onPress={() => setIngModal(false)}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <FlatList
            data={ingredients}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.ingPickRow, selectedIng === item.id && styles.ingPickRowActive]}
                onPress={() => setSelectedIng(selectedIng === item.id ? null : item.id)}
              >
                <Text style={styles.ingPickName}>{item.name}</Text>
                <Text style={styles.ingPickUnit}>{item.unit}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No ingredients yet. Add from Ingredients tab first.</Text>}
          />
          {selectedIng && (
            <View style={styles.qtyRow}>
              <Input label="Quantity" value={ingQty} onChangeText={setIngQty} placeholder="e.g. 500" keyboardType="numeric" style={styles.qtyInput} />
              <Button label="Add" onPress={handleAddIngredient} style={styles.qtyBtn} />
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, backgroundColor: COLORS.primary },
  backBtn: { color: '#fff', fontSize: FontSize.md, fontWeight: '600' },
  title: { fontSize: FontSize.xl, fontWeight: '900', color: '#fff' },
  scroll: { padding: Spacing.md },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8, marginTop: Spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.sm },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surfaceAlt },
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipText: { fontSize: FontSize.sm, color: COLORS.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  yieldRow: { flexDirection: 'row', gap: Spacing.sm },
  yieldInput: { flex: 1 },
  yieldUnitInput: { flex: 1 },
  addIngBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.sm },
  addIngText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  ingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceAlt, borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: 6 },
  ingName: { flex: 1, fontSize: FontSize.md, color: COLORS.textPrimary },
  ingQty: { fontSize: FontSize.md, fontWeight: '700', color: COLORS.accent, marginRight: Spacing.sm },
  ingRemove: { color: COLORS.error, fontWeight: '700', fontSize: FontSize.md },
  saveBtn: { marginTop: Spacing.xl, marginBottom: Spacing.xl },
  modal: { flex: 1, backgroundColor: COLORS.surface },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '800', color: COLORS.textPrimary },
  modalClose: { fontSize: FontSize.xl, color: COLORS.textSecondary },
  ingPickRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  ingPickRowActive: { backgroundColor: COLORS.accent + '18' },
  ingPickName: { fontSize: FontSize.md, color: COLORS.textPrimary, fontWeight: '600' },
  ingPickUnit: { fontSize: FontSize.sm, color: COLORS.textSecondary },
  qtyRow: { flexDirection: 'row', padding: Spacing.md, gap: Spacing.sm, borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: 'flex-end' },
  qtyInput: { flex: 1 },
  qtyBtn: { paddingHorizontal: 20 },
  empty: { textAlign: 'center', padding: Spacing.xl, color: COLORS.textSecondary },
});
