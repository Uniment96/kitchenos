import { create } from 'zustand';
import { nanoid } from '../utils/nanoid';
import { dbGetRecipes, dbGetRecipeById, dbUpsertRecipe, dbDeleteRecipe } from '../services/database/db';
import { orgAdd, orgUpdate, orgDelete } from '../services/firebase/organization';
import type { Recipe, RecipeIngredient } from '../types';

interface RecipeState {
  recipes: Recipe[];
  loading: boolean;

  load: (ownerId: string) => Promise<void>;
  getById: (id: string) => Promise<Recipe | null>;
  add: (
    ownerId: string,
    createdBy: string,
    data: {
      name: string;
      description?: string;
      category?: string;
      baseYield: number;
      yieldUnit: string;
      ingredients: RecipeIngredient[];
      instructions?: string;
      prepTimeMinutes?: number;
      cookTimeMinutes?: number;
    }
  ) => Promise<string>;
  update: (ownerId: string, id: string, data: Partial<Omit<Recipe, 'id' | 'ownerId' | 'createdBy' | 'createdAt'>>) => Promise<void>;
  remove: (ownerId: string, id: string) => Promise<void>;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  loading: false,

  load: async (ownerId) => {
    set({ loading: true });
    const recipes = await dbGetRecipes(ownerId);
    set({ recipes, loading: false });
  },

  getById: async (id) => {
    const cached = get().recipes.find((r) => r.id === id);
    if (cached) return cached;
    return dbGetRecipeById(id);
  },

  add: async (ownerId, createdBy, data) => {
    const id = nanoid();
    const recipe: Omit<Recipe, 'createdAt' | 'updatedAt'> & { id: string } = {
      id, ownerId, createdBy, ...data,
    };
    await dbUpsertRecipe(recipe);
    const full: Recipe = { ...recipe, createdAt: new Date(), updatedAt: new Date() };
    set((s) => ({
      recipes: [...s.recipes, full].sort((a, b) => a.name.localeCompare(b.name)),
    }));
    orgAdd(ownerId, createdBy, 'recipes', { ...data, id }).catch(() => null);
    return id;
  },

  update: async (ownerId, id, data) => {
    set((s) => ({
      recipes: s.recipes.map((r) =>
        r.id === id ? { ...r, ...data, updatedAt: new Date() } : r
      ),
    }));
    const found = get().recipes.find((r) => r.id === id);
    if (found) {
      await dbUpsertRecipe({ ...found, ...data, id });
      orgUpdate(ownerId, 'recipes', id, {
        ...data,
        ingredients: data.ingredients ? JSON.stringify(data.ingredients) : undefined,
      }).catch(() => null);
    }
  },

  remove: async (ownerId, id) => {
    await dbDeleteRecipe(id);
    set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) }));
    orgDelete(ownerId, 'recipes', id).catch(() => null);
  },
}));
