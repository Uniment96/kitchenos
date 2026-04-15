// Re-export auth types
export type { UserRole, UserProfile, AuthUser } from './auth';

// ---------------------------------------------------------------------------
// Ingredient
// ---------------------------------------------------------------------------

export type Unit = 'g' | 'kg' | 'ml' | 'L' | 'pcs' | 'tsp' | 'tbsp' | 'cup' | 'oz' | 'lb';

export interface Ingredient {
  id: string;
  name: string;
  unit: Unit;
  category?: string;
  ownerId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Recipe
// ---------------------------------------------------------------------------

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: Unit;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  category?: string;
  baseYield: number;       // e.g. 10 (portions)
  yieldUnit: string;       // e.g. "portions", "kg", "plates"
  ingredients: RecipeIngredient[];
  instructions?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  ownerId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Production Log
// ---------------------------------------------------------------------------

export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface ProductionLog {
  id: string;
  recipeId: string;
  recipeName: string;
  requiredYield: number;   // what was actually produced
  yieldUnit: string;
  scaleFactor: number;     // requiredYield / baseYield
  notes?: string;
  loggedBy: string;        // uid
  loggedByName: string;    // display name
  loggedAt: Date;
  ownerId: string;
  createdBy: string;
  syncStatus: SyncStatus;  // for offline-first
}

// ---------------------------------------------------------------------------
// Staff
// ---------------------------------------------------------------------------

export interface StaffMember {
  uid: string;
  email: string;
  displayName: string;
  ownerId: string;
  createdAt: Date;
}
