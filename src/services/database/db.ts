import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schema';
import type { Ingredient, Recipe, ProductionLog, SyncStatus } from '../../types';

// ---------------------------------------------------------------------------
// Database singleton
// ---------------------------------------------------------------------------

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('kitchenos.db');
  await _db.execAsync(CREATE_TABLES_SQL);
  return _db;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function now(): number {
  return Date.now();
}

function rowToIngredient(row: Record<string, unknown>): Ingredient {
  return {
    id: row.id as string,
    name: row.name as string,
    unit: row.unit as Ingredient['unit'],
    category: (row.category as string) || undefined,
    ownerId: row.ownerId as string,
    createdBy: row.createdBy as string,
    createdAt: new Date(row.createdAt as number),
    updatedAt: new Date(row.updatedAt as number),
  };
}

function rowToRecipe(row: Record<string, unknown>): Recipe {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || undefined,
    category: (row.category as string) || undefined,
    baseYield: row.baseYield as number,
    yieldUnit: row.yieldUnit as string,
    ingredients: JSON.parse(row.ingredients as string),
    instructions: (row.instructions as string) || undefined,
    prepTimeMinutes: (row.prepTimeMinutes as number) || undefined,
    cookTimeMinutes: (row.cookTimeMinutes as number) || undefined,
    ownerId: row.ownerId as string,
    createdBy: row.createdBy as string,
    createdAt: new Date(row.createdAt as number),
    updatedAt: new Date(row.updatedAt as number),
  };
}

function rowToLog(row: Record<string, unknown>): ProductionLog {
  return {
    id: row.id as string,
    recipeId: row.recipeId as string,
    recipeName: row.recipeName as string,
    requiredYield: row.requiredYield as number,
    yieldUnit: row.yieldUnit as string,
    scaleFactor: row.scaleFactor as number,
    notes: (row.notes as string) || undefined,
    loggedBy: row.loggedBy as string,
    loggedByName: row.loggedByName as string,
    loggedAt: new Date(row.loggedAt as number),
    ownerId: row.ownerId as string,
    createdBy: row.createdBy as string,
    syncStatus: row.syncStatus as SyncStatus,
  };
}

// ---------------------------------------------------------------------------
// Ingredients
// ---------------------------------------------------------------------------

export async function dbGetIngredients(ownerId: string): Promise<Ingredient[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM ingredients WHERE ownerId = ? ORDER BY name ASC',
    [ownerId]
  );
  return rows.map(rowToIngredient);
}

export async function dbUpsertIngredient(
  ingredient: Omit<Ingredient, 'createdAt' | 'updatedAt'> & { id: string }
): Promise<void> {
  const db = await getDb();
  const ts = now();
  await db.runAsync(
    `INSERT INTO ingredients (id, name, unit, category, ownerId, createdBy, createdAt, updatedAt, syncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name, unit=excluded.unit, category=excluded.category, updatedAt=excluded.updatedAt, syncStatus='pending'`,
    [ingredient.id, ingredient.name, ingredient.unit, ingredient.category ?? null,
     ingredient.ownerId, ingredient.createdBy, ts, ts]
  );
}

export async function dbDeleteIngredient(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM ingredients WHERE id = ?', [id]);
}

// ---------------------------------------------------------------------------
// Recipes
// ---------------------------------------------------------------------------

export async function dbGetRecipes(ownerId: string): Promise<Recipe[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM recipes WHERE ownerId = ? ORDER BY name ASC',
    [ownerId]
  );
  return rows.map(rowToRecipe);
}

export async function dbGetRecipeById(id: string): Promise<Recipe | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM recipes WHERE id = ?',
    [id]
  );
  return row ? rowToRecipe(row) : null;
}

export async function dbUpsertRecipe(
  recipe: Omit<Recipe, 'createdAt' | 'updatedAt'> & { id: string }
): Promise<void> {
  const db = await getDb();
  const ts = now();
  await db.runAsync(
    `INSERT INTO recipes
       (id, name, description, category, baseYield, yieldUnit, ingredients, instructions,
        prepTimeMinutes, cookTimeMinutes, ownerId, createdBy, createdAt, updatedAt, syncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name, description=excluded.description, category=excluded.category,
       baseYield=excluded.baseYield, yieldUnit=excluded.yieldUnit,
       ingredients=excluded.ingredients, instructions=excluded.instructions,
       prepTimeMinutes=excluded.prepTimeMinutes, cookTimeMinutes=excluded.cookTimeMinutes,
       updatedAt=excluded.updatedAt, syncStatus='pending'`,
    [
      recipe.id, recipe.name, recipe.description ?? null, recipe.category ?? null,
      recipe.baseYield, recipe.yieldUnit, JSON.stringify(recipe.ingredients),
      recipe.instructions ?? null, recipe.prepTimeMinutes ?? null,
      recipe.cookTimeMinutes ?? null, recipe.ownerId, recipe.createdBy, ts, ts,
    ]
  );
}

export async function dbDeleteRecipe(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM recipes WHERE id = ?', [id]);
}

// ---------------------------------------------------------------------------
// Production Logs
// ---------------------------------------------------------------------------

export async function dbGetLogs(ownerId: string): Promise<ProductionLog[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM production_logs WHERE ownerId = ? ORDER BY loggedAt DESC',
    [ownerId]
  );
  return rows.map(rowToLog);
}

export async function dbGetMyLogs(loggedBy: string): Promise<ProductionLog[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM production_logs WHERE loggedBy = ? ORDER BY loggedAt DESC',
    [loggedBy]
  );
  return rows.map(rowToLog);
}

export async function dbInsertLog(log: Omit<ProductionLog, 'syncStatus'>): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO production_logs
       (id, recipeId, recipeName, requiredYield, yieldUnit, scaleFactor, notes,
        loggedBy, loggedByName, loggedAt, ownerId, createdBy, syncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      log.id, log.recipeId, log.recipeName, log.requiredYield, log.yieldUnit,
      log.scaleFactor, log.notes ?? null, log.loggedBy, log.loggedByName,
      log.loggedAt.getTime(), log.ownerId, log.createdBy,
    ]
  );
}

export async function dbGetPendingLogs(): Promise<ProductionLog[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    "SELECT * FROM production_logs WHERE syncStatus = 'pending'",
    []
  );
  return rows.map(rowToLog);
}

export async function dbMarkLogSynced(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE production_logs SET syncStatus = 'synced' WHERE id = ?",
    [id]
  );
}

export async function dbMarkLogFailed(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE production_logs SET syncStatus = 'failed' WHERE id = ?",
    [id]
  );
}
