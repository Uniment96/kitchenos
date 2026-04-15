/**
 * Offline → Firestore sync engine.
 *
 * On reconnect, iterates over production_logs with syncStatus='pending'
 * and pushes them to organizations/{ownerId}/productionLogs/{id}.
 * On success marks them 'synced'; on failure marks 'failed'.
 *
 * Recipes and ingredients are written directly to Firestore when online
 * (optimistic), and fall back to SQLite-only when offline.
 */

import NetInfo from '@react-native-community/netinfo';
import { orgSet } from '../firebase/organization';
import {
  dbGetPendingLogs,
  dbMarkLogSynced,
  dbMarkLogFailed,
} from '../database/db';

let _unsubscribe: (() => void) | null = null;
let _isSyncing = false;

async function syncPendingLogs(): Promise<void> {
  if (_isSyncing) return;
  _isSyncing = true;
  try {
    const pending = await dbGetPendingLogs();
    for (const log of pending) {
      try {
        await orgSet(log.ownerId, log.createdBy, 'productionLogs', log.id, {
          recipeId: log.recipeId,
          recipeName: log.recipeName,
          requiredYield: log.requiredYield,
          yieldUnit: log.yieldUnit,
          scaleFactor: log.scaleFactor,
          notes: log.notes ?? null,
          loggedBy: log.loggedBy,
          loggedByName: log.loggedByName,
          loggedAt: log.loggedAt.getTime(),
        });
        await dbMarkLogSynced(log.id);
      } catch {
        await dbMarkLogFailed(log.id);
      }
    }
  } finally {
    _isSyncing = false;
  }
}

/**
 * Start listening to network state changes.
 * When the device comes online, flush all pending logs to Firestore.
 * Returns an unsubscribe function.
 */
export function startSyncEngine(): () => void {
  if (_unsubscribe) _unsubscribe();

  _unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable) {
      syncPendingLogs().catch(() => null);
    }
  });

  // Also attempt immediately in case we're already online
  NetInfo.fetch().then((state) => {
    if (state.isConnected && state.isInternetReachable) {
      syncPendingLogs().catch(() => null);
    }
  });

  return () => {
    if (_unsubscribe) {
      _unsubscribe();
      _unsubscribe = null;
    }
  };
}

/** Manually trigger a sync (e.g. after a pull-to-refresh). */
export function triggerSync(): void {
  NetInfo.fetch().then((state) => {
    if (state.isConnected && state.isInternetReachable) {
      syncPendingLogs().catch(() => null);
    }
  });
}
