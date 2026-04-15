import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useRecipeStore } from '@/store/recipeStore';
import { useProductionStore } from '@/store/productionStore';
import { useUIStore } from '@/store/uiStore';
import IngredientRow from '@/components/recipe/IngredientRow';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { scaleRecipe } from '@/utils/scalingEngine';
import { COLORS, Spacing, FontSize, Radius, Shadow } from '@/constants/theme';
import type { Recipe } from '@/types';

export default function StaffRecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useAuthStore((s) => s.profile);
  const { getById } = useRecipeStore();
  const { addLog } = useProductionStore();
  const showToast = useUIStore((s) => s.showToast);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [requiredYield, setRequiredYield] = useState('');
  const [notes, setNotes] = useState('');
  const [logModal, setLogModal] = useState(false);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    if (id) getById(id).then(setRecipe);
  }, [id]);

  const scaled = recipe && requiredYield && !isNaN(parseFloat(requiredYield))
    ? scaleRecipe(recipe, parseFloat(requiredYield))
    : null;

  const handleLog = async () => {
    if (!scaled || !profile || !recipe) return;
    setLogging(true);
    try {
      await addLog({
        recipeId: recipe.id,
        recipeName: recipe.name,
        requiredYield: scaled.requiredYield,
        yieldUnit: recipe.yieldUnit,
        scaleFactor: scaled.scaleFactor,
        notes: notes.trim() || undefined,
        loggedBy: profile.uid,
        loggedByName: profile.displayName ?? profile.email,
        ownerId: profile.ownerId,
        createdBy: profile.uid,
      });
      showToast('Production logged', 'success');
      setLogModal(false);
      setNotes('');
    } catch {
      showToast('Failed to log production', 'error');
    } finally { setLogging(false); }
  };

  if (!recipe) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{recipe.name}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {recipe.category && <Text style={styles.category}>{recipe.category}</Text>}
        <Text style={styles.name}>{recipe.name}</Text>
        {recipe.description && <Text style={styles.desc}>{recipe.description}</Text>}

        {/* Yield info */}
        <View style={styles.yieldCard}>
          <Text style={styles.yieldLabel}>Base yield</Text>
          <Text style={styles.yieldValue}>{recipe.baseYield} {recipe.yieldUnit}</Text>
        </View>

        {/* Scaling input */}
        <View style={styles.scaleCard}>
          <Text style={styles.scaleTitle}>Scale Recipe</Text>
          <View style={styles.scaleRow}>
            <TextInput
              style={styles.scaleInput}
              value={requiredYield}
              onChangeText={setRequiredYield}
              placeholder={`e.g. ${recipe.baseYield * 2}`}
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
            />
            <Text style={styles.scaleUnit}>{recipe.yieldUnit}</Text>
          </View>
          {scaled && (
            <Text style={styles.scaleFactor}>
              Scale factor: ×{scaled.scaleFactor.toFixed(3)}
            </Text>
          )}
        </View>

        {/* Ingredients */}
        <Text style={styles.sectionTitle}>
          Ingredients {scaled ? '(scaled)' : '(base quantities)'}
        </Text>
        <View style={styles.ingCard}>
          {(scaled?.scaledIngredients ?? recipe.ingredients).map((ing) => (
            <IngredientRow
              key={ing.ingredientId}
              ingredient={ing}
              showScaled={!!scaled}
            />
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

        {/* Log Production */}
        <Button
          label="Log Production"
          onPress={() => {
            if (!requiredYield || isNaN(parseFloat(requiredYield))) {
              Alert.alert('Enter Yield', 'Please enter the required yield before logging.');
              return;
            }
            setLogModal(true);
          }}
          style={styles.logBtn}
        />
      </ScrollView>

      {/* Log confirmation modal */}
      <Modal visible={logModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log Production</Text>
            <TouchableOpacity onPress={() => setLogModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryRecipe}>{recipe.name}</Text>
              <Text style={styles.summaryYield}>{scaled?.requiredYield} {recipe.yieldUnit}</Text>
              <Text style={styles.summaryFactor}>×{scaled?.scaleFactor.toFixed(3)} scale</Text>
            </View>
            <Input label="Notes (optional)" value={notes} onChangeText={setNotes}
              placeholder="Any production notes..." multiline numberOfLines={3} />
            <Button label="Confirm Log" onPress={handleLog} loading={logging} style={styles.confirmBtn} />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, backgroundColor: COLORS.primary },
  backBtn: { color: '#fff', fontSize: FontSize.md, fontWeight: '600', width: 60 },
  headerTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: '800', color: '#fff', textAlign: 'center' },
  scroll: { padding: Spacing.md },
  category: { fontSize: FontSize.xs, fontWeight: '800', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  name: { fontSize: FontSize.xxl, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 8 },
  desc: { fontSize: FontSize.md, color: COLORS.textSecondary, lineHeight: 22, marginBottom: Spacing.md },
  yieldCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  yieldLabel: { fontSize: FontSize.md, color: COLORS.textSecondary },
  yieldValue: { fontSize: FontSize.lg, fontWeight: '800', color: COLORS.textPrimary },
  scaleCard: { backgroundColor: COLORS.primary, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  scaleTitle: { fontSize: FontSize.md, fontWeight: '800', color: '#fff', marginBottom: Spacing.sm },
  scaleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  scaleInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: FontSize.xl, fontWeight: '900', color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  scaleUnit: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.md, fontWeight: '600' },
  scaleFactor: { color: COLORS.accent, fontSize: FontSize.sm, fontWeight: '700', marginTop: 8 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', color: COLORS.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  ingCard: { backgroundColor: COLORS.surface, borderRadius: Radius.md, marginBottom: Spacing.md, ...Shadow.sm, overflow: 'hidden' },
  instrCard: { backgroundColor: COLORS.surface, borderRadius: Radius.md, padding: Spacing.md, ...Shadow.sm, marginBottom: Spacing.md },
  instrText: { fontSize: FontSize.md, color: COLORS.textPrimary, lineHeight: 24 },
  logBtn: { marginBottom: Spacing.xl },
  modal: { flex: 1, backgroundColor: COLORS.surface },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '800', color: COLORS.textPrimary },
  modalClose: { fontSize: FontSize.xl, color: COLORS.textSecondary },
  modalBody: { padding: Spacing.md },
  summaryCard: { backgroundColor: COLORS.primary, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'center' },
  summaryRecipe: { fontSize: FontSize.lg, fontWeight: '800', color: '#fff', marginBottom: 4 },
  summaryYield: { fontSize: FontSize.xxl, fontWeight: '900', color: COLORS.accent },
  summaryFactor: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  confirmBtn: { marginTop: Spacing.md },
});
