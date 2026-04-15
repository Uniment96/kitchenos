export const COLORS = {
  // Brand
  primary: '#1a1a2e',
  primaryLight: '#16213e',
  accent: '#e94560',

  // Surfaces
  surface: '#ffffff',
  surfaceAlt: '#f8f9fa',
  surfaceElevated: '#ffffff',

  // Text
  textPrimary: '#1a1a2e',
  textSecondary: '#6c757d',
  textLight: '#ffffff',
  textMuted: '#adb5bd',

  // Borders
  border: '#e0e0e0',
  borderLight: '#f0f0f0',

  // Status
  success: '#27ae60',
  warning: '#f39c12',
  error: '#e74c3c',
  info: '#3498db',

  // Sync status
  pending: '#f39c12',
  synced: '#27ae60',
  failed: '#e74c3c',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
} as const;

export const UNIT_OPTIONS: string[] = [
  'g', 'kg', 'ml', 'L', 'pcs', 'tsp', 'tbsp', 'cup', 'oz', 'lb',
];

export const RECIPE_CATEGORIES = [
  'Starter', 'Main Course', 'Dessert', 'Sauce', 'Soup',
  'Salad', 'Beverage', 'Bread', 'Pastry', 'Other',
];

export const INGREDIENT_CATEGORIES = [
  'Meat', 'Seafood', 'Vegetables', 'Fruits', 'Dairy',
  'Grains', 'Spices', 'Oils', 'Condiments', 'Other',
];
