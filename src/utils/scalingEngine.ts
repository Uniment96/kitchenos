import type { Recipe, RecipeIngredient } from '../types';

/**
 * Core scaling formula:
 *   scaleFactor = requiredYield / baseYield
 *   scaledQty   = ingredient.quantity * scaleFactor
 */

export interface ScaledIngredient extends RecipeIngredient {
  scaledQuantity: number;
}

export interface ScaledRecipe {
  recipe: Recipe;
  requiredYield: number;
  scaleFactor: number;
  scaledIngredients: ScaledIngredient[];
}

export function scaleRecipe(recipe: Recipe, requiredYield: number): ScaledRecipe {
  const scaleFactor = requiredYield / recipe.baseYield;
  const scaledIngredients: ScaledIngredient[] = recipe.ingredients.map((ing) => ({
    ...ing,
    scaledQuantity: round(ing.quantity * scaleFactor),
  }));
  return { recipe, requiredYield, scaleFactor, scaledIngredients };
}

/** Round to 3 significant decimals to avoid floating-point noise. */
function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Format a quantity for display: integers show without decimal, else 2dp. */
export function formatQty(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}
