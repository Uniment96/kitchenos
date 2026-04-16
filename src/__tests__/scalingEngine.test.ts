import { scaleRecipe, formatQty } from '../utils/scalingEngine';
import type { Recipe } from '../types';

const baseRecipe: Recipe = {
  id: 'r1',
  name: 'Tomato Bisque',
  baseYield: 10,
  yieldUnit: 'portions',
  ingredients: [
    { ingredientId: 'i1', ingredientName: 'Tomato', quantity: 500, unit: 'g' },
    { ingredientId: 'i2', ingredientName: 'Cream',  quantity: 200, unit: 'ml' },
    { ingredientId: 'i3', ingredientName: 'Salt',   quantity: 5,   unit: 'g' },
  ],
  ownerId: 'admin1',
  createdBy: 'admin1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('scaleRecipe', () => {
  it('returns scaleFactor of 1 when requiredYield equals baseYield', () => {
    const result = scaleRecipe(baseRecipe, 10);
    expect(result.scaleFactor).toBe(1);
  });

  it('doubles quantities when yield is doubled', () => {
    const result = scaleRecipe(baseRecipe, 20);
    expect(result.scaleFactor).toBe(2);
    expect(result.scaledIngredients[0].scaledQuantity).toBe(1000);
    expect(result.scaledIngredients[1].scaledQuantity).toBe(400);
    expect(result.scaledIngredients[2].scaledQuantity).toBe(10);
  });

  it('halves quantities when yield is halved', () => {
    const result = scaleRecipe(baseRecipe, 5);
    expect(result.scaleFactor).toBe(0.5);
    expect(result.scaledIngredients[0].scaledQuantity).toBe(250);
    expect(result.scaledIngredients[1].scaledQuantity).toBe(100);
  });

  it('rounds to 3 decimal places', () => {
    const result = scaleRecipe(baseRecipe, 3); // scaleFactor = 0.3
    // 500 * 0.3 = 150 exactly
    expect(result.scaledIngredients[0].scaledQuantity).toBe(150);
    // 5 * 0.3 = 1.5 exactly
    expect(result.scaledIngredients[2].scaledQuantity).toBe(1.5);
  });

  it('includes requiredYield and recipe in the result', () => {
    const result = scaleRecipe(baseRecipe, 15);
    expect(result.requiredYield).toBe(15);
    expect(result.recipe).toBe(baseRecipe);
  });

  it('preserves all ingredient fields in scaledIngredients', () => {
    const result = scaleRecipe(baseRecipe, 20);
    expect(result.scaledIngredients[0].ingredientId).toBe('i1');
    expect(result.scaledIngredients[0].ingredientName).toBe('Tomato');
    expect(result.scaledIngredients[0].unit).toBe('g');
  });
});

describe('formatQty', () => {
  it('formats whole numbers without decimal', () => {
    expect(formatQty(100)).toBe('100');
    expect(formatQty(0)).toBe('0');
    expect(formatQty(1)).toBe('1');
  });

  it('formats decimals to 2 decimal places', () => {
    expect(formatQty(1.5)).toBe('1.50');
    expect(formatQty(0.333)).toBe('0.33');
    expect(formatQty(10.1)).toBe('10.10');
  });

  it('handles negative numbers', () => {
    expect(formatQty(-5)).toBe('-5');
    expect(formatQty(-2.5)).toBe('-2.50');
  });
});
