import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useIngredientStore } from '@/store/ingredientStore';
import { useUIStore } from '@/store/uiStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { COLORS, Spacing, FontSize, Radius, Shadow, UNIT_OPTIONS, INGREDIENT_CATEGORIES } from '@/constants/theme';
import type { Unit } from '@/types';

export default function IngredientsScreen() {
  const profile = useAuthStore((s) => s.profile);
  const { ingredients, loading, load, add, remove } = useIngredientStore();
  const showToast = useUIStore((s) => s.showToast);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<Unit>('g');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.ownerId) load(profile.ownerId);
  }, [profile?.ownerId]);

  const filtered = ingredients.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!name.trim()) { showToast('Name is required', 'warning'); return; }
    setSaving(true);
    try {
      await add(profile!.ownerId, profile!.uid, { name: name.trim(), unit, category: category || undefined });
      showToast('Ingredient added', 'success');
      setModalVisible(false);
      setName(''); setUnit('g'); setCategory('');
    } catch {
      showToast('Failed to add ingredient', 'error');
    } finally { setSaving(false); }
  };

  const confirmDelete = (id: string, ingName: string) => {
    Alert.alert('Delete Ingredient', `Remove "${ingName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(profile!.ownerId, id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Ingredients</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <TextInput style={styles.search} placeholder="Search ingredients..."
          placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{item.name}</Text>
              {item.category && <Text style={styles.rowCat}>{item.category}</Text>}
            </View>
            <Text style={styles.rowUnit}>{item.unit}</Text>
            <TouchableOpacity onPress={() => confirmDelete(item.id, item.name)} style={styles.delBtn}>
              <Text style={styles.delText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={loading ? null : (
          <EmptyState icon="🥬" title="No ingredients yet" subtitle="Tap + Add to get started" />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Ingredient</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Input label="Name" value={name} onChangeText={setName} placeholder="e.g. Flour" />

            <Text style={styles.pickLabel}>Unit</Text>
            <View style={styles.chips}>
              {UNIT_OPTIONS.map((u) => (
                <TouchableOpacity key={u} style={[styles.chip, unit === u && styles.chipActive]}
                  onPress={() => setUnit(u as Unit)}>
                  <Text style={[styles.chipText, unit === u && styles.chipTextActive]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.pickLabel}>Category (optional)</Text>
            <View style={styles.chips}>
              {INGREDIENT_CATEGORIES.map((c) => (
                <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipActive]}
                  onPress={() => setCategory(category === c ? '' : c)}>
                  <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button label="Add Ingredient" onPress={handleAdd} loading={saving} style={styles.saveBtn} />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surfaceAlt },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, backgroundColor: COLORS.primary },
  title: { fontSize: FontSize.xl, fontWeight: '900', color: '#fff' },
  addBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.sm },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.sm },
  searchWrap: { padding: Spacing.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  search: { backgroundColor: COLORS.surfaceAlt, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: FontSize.md, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  list: { padding: Spacing.md, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm },
  rowInfo: { flex: 1 },
  rowName: { fontSize: FontSize.md, fontWeight: '700', color: COLORS.textPrimary },
  rowCat: { fontSize: FontSize.xs, color: COLORS.textSecondary, marginTop: 2 },
  rowUnit: { fontSize: FontSize.md, fontWeight: '700', color: COLORS.accent, marginRight: Spacing.md },
  delBtn: { padding: 6 },
  delText: { color: COLORS.error, fontWeight: '700' },
  modal: { flex: 1, backgroundColor: COLORS.surface },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '800', color: COLORS.textPrimary },
  modalClose: { fontSize: FontSize.xl, color: COLORS.textSecondary },
  modalBody: { padding: Spacing.md },
  pickLabel: { fontSize: FontSize.sm, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8, marginTop: Spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surfaceAlt },
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipText: { fontSize: FontSize.sm, color: COLORS.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  saveBtn: { marginTop: Spacing.xl },
});
