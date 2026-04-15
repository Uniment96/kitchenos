/**
 * SQLite schema for KitchenOS offline-first storage.
 *
 * Tables mirror Firestore collections but live locally on device.
 * The sync engine pushes rows with syncStatus='pending' to Firestore.
 */

export const CREATE_TABLES_SQL = `
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS ingredients (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    unit         TEXT NOT NULL,
    category     TEXT,
    ownerId      TEXT NOT NULL,
    createdBy    TEXT NOT NULL,
    createdAt    INTEGER NOT NULL,
    updatedAt    INTEGER NOT NULL,
    syncStatus   TEXT NOT NULL DEFAULT 'pending'
  );

  CREATE TABLE IF NOT EXISTS recipes (
    id               TEXT PRIMARY KEY,
    name             TEXT NOT NULL,
    description      TEXT,
    category         TEXT,
    baseYield        REAL NOT NULL,
    yieldUnit        TEXT NOT NULL,
    ingredients      TEXT NOT NULL,   -- JSON array of RecipeIngredient
    instructions     TEXT,
    prepTimeMinutes  INTEGER,
    cookTimeMinutes  INTEGER,
    ownerId          TEXT NOT NULL,
    createdBy        TEXT NOT NULL,
    createdAt        INTEGER NOT NULL,
    updatedAt        INTEGER NOT NULL,
    syncStatus       TEXT NOT NULL DEFAULT 'pending'
  );

  CREATE TABLE IF NOT EXISTS production_logs (
    id             TEXT PRIMARY KEY,
    recipeId       TEXT NOT NULL,
    recipeName     TEXT NOT NULL,
    requiredYield  REAL NOT NULL,
    yieldUnit      TEXT NOT NULL,
    scaleFactor    REAL NOT NULL,
    notes          TEXT,
    loggedBy       TEXT NOT NULL,
    loggedByName   TEXT NOT NULL,
    loggedAt       INTEGER NOT NULL,
    ownerId        TEXT NOT NULL,
    createdBy      TEXT NOT NULL,
    syncStatus     TEXT NOT NULL DEFAULT 'pending'
  );

  CREATE INDEX IF NOT EXISTS idx_ingredients_owner ON ingredients(ownerId);
  CREATE INDEX IF NOT EXISTS idx_recipes_owner     ON recipes(ownerId);
  CREATE INDEX IF NOT EXISTS idx_logs_owner        ON production_logs(ownerId);
  CREATE INDEX IF NOT EXISTS idx_logs_recipe       ON production_logs(recipeId);
  CREATE INDEX IF NOT EXISTS idx_logs_sync         ON production_logs(syncStatus);
`;
