import { create } from 'zustand';
import { nanoid } from '../utils/nanoid';
import { dbGetLogs, dbGetMyLogs, dbInsertLog } from '../services/database/db';
import type { ProductionLog } from '../types';

interface ProductionState {
  logs: ProductionLog[];        // all logs (admin view)
  myLogs: ProductionLog[];      // current user's logs (staff view)
  loading: boolean;

  loadAll: (ownerId: string) => Promise<void>;
  loadMine: (loggedBy: string) => Promise<void>;
  addLog: (log: {
    recipeId: string;
    recipeName: string;
    requiredYield: number;
    yieldUnit: string;
    scaleFactor: number;
    notes?: string;
    loggedBy: string;
    loggedByName: string;
    ownerId: string;
    createdBy: string;
  }) => Promise<void>;
}

export const useProductionStore = create<ProductionState>((set) => ({
  logs: [],
  myLogs: [],
  loading: false,

  loadAll: async (ownerId) => {
    set({ loading: true });
    const logs = await dbGetLogs(ownerId);
    set({ logs, loading: false });
  },

  loadMine: async (loggedBy) => {
    set({ loading: true });
    const myLogs = await dbGetMyLogs(loggedBy);
    set({ myLogs, loading: false });
  },

  addLog: async (data) => {
    const log: Omit<ProductionLog, 'syncStatus'> = {
      id: nanoid(),
      loggedAt: new Date(),
      ...data,
    };
    await dbInsertLog(log);
    const full: ProductionLog = { ...log, syncStatus: 'pending' };
    set((s) => ({
      logs: [full, ...s.logs],
      myLogs: [full, ...s.myLogs],
    }));
  },
}));
