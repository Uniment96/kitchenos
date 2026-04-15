import { create } from 'zustand';
import { nanoid } from '../utils/nanoid';
import { dbGetIngredients, dbUpsertIngredient, dbDeleteIngredient } from '../services/database/db';
import { orgAdd, orgUpdate, orgDelete } from '../services/firebase/organization';
import type { Ingredient, Unit } from '../types';

interface IngredientState {
  ingredients: Ingredient[];
  loading: boolean;

  load: (ownerId: string) => Promise<void>;
  add: (ownerId: string, createdBy: string, data: { name: string; unit: Unit; category?: string }) => Promise<void>;
  update: (ownerId: string, id: string, data: Partial<Pick<Ingredient, 'name' | 'unit' | 'category'>>) => Promise<void>;
  remove: (ownerId: string, id: string) => Promise<void>;
}

export const useIngredientStore = create<IngredientState>((set, get) => ({
  ingredients: [],
  loading: false,

  load: async (ownerId) => {
    set({ loading: true });
    const ingredients = await dbGetIngredients(ownerId);
    set({ ingredients, loading: false });
  },

  add: async (ownerId, createdBy, data) => {
    const id = nanoid();
    const ingredient: Omit<Ingredient, 'createdAt' | 'updatedAt'> & { id: string } = {
      id, ownerId, createdBy, ...data,
    };
    // Write to SQLite immediately
    await dbUpsertIngredient(ingredient);
    set((s) => ({
      ingredients: [...s.ingredients, {
        ...ingredient,
        createdAt: new Date(),
        updatedAt: new Date(),
      }].sort((a, b) => a.name.localeCompare(b.name)),
    }));
    // Write to Firestore (best-effort; offline-safe)
    orgAdd(ownerId, createdBy, 'ingredients', { ...data, id }).catch(() => null);
  },

  update: async (ownerId, id, data) => {
    set((s) => ({
      ingredients: s.ingredients.map((i) =>
        i.id === id ? { ...i, ...data, updatedAt: new Date() } : i
      ),
    }));
    const found = get().ingredients.find((i) => i.id === id);
    if (found) {
      await dbUpsertIngredient({ ...found, ...data, id });
      orgUpdate(ownerId, 'ingredients', id, data).catch(() => null);
    }
  },

  remove: async (ownerId, id) => {
    await dbDeleteIngredient(id);
    set((s) => ({ ingredients: s.ingredients.filter((i) => i.id !== id) }));
    orgDelete(ownerId, 'ingredients', id).catch(() => null);
  },
}));
