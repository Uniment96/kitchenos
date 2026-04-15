import { create } from 'zustand';
import { createStaffUser, listStaffMembers, removeStaffProfile } from '../services/firebase/users';
import type { StaffMember } from '../types';

interface StaffState {
  staff: StaffMember[];
  loading: boolean;
  error: string | null;

  load: (adminUid: string) => Promise<void>;
  addStaff: (adminUid: string, email: string, password: string, displayName: string) => Promise<void>;
  removeStaff: (staffUid: string) => Promise<void>;
  clearError: () => void;
}

export const useStaffStore = create<StaffState>((set) => ({
  staff: [],
  loading: false,
  error: null,

  load: async (adminUid) => {
    set({ loading: true, error: null });
    try {
      const profiles = await listStaffMembers(adminUid);
      const staff: StaffMember[] = profiles.map((p) => ({
        uid: p.uid,
        email: p.email,
        displayName: p.displayName ?? p.email,
        ownerId: p.ownerId,
        createdAt: p.createdAt,
      }));
      set({ staff, loading: false });
    } catch (err: unknown) {
      set({ error: errMsg(err), loading: false });
    }
  },

  addStaff: async (adminUid, email, password, displayName) => {
    set({ loading: true, error: null });
    try {
      const profile = await createStaffUser(adminUid, email, password, displayName);
      const member: StaffMember = {
        uid: profile.uid,
        email: profile.email,
        displayName: displayName,
        ownerId: adminUid,
        createdAt: profile.createdAt,
      };
      set((s) => ({ staff: [...s.staff, member], loading: false }));
    } catch (err: unknown) {
      set({ error: errMsg(err), loading: false });
      throw err;
    }
  },

  removeStaff: async (staffUid) => {
    await removeStaffProfile(staffUid);
    set((s) => ({ staff: s.staff.filter((m) => m.uid !== staffUid) }));
  },

  clearError: () => set({ error: null }),
}));

function errMsg(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
