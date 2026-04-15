import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthChanged, signIn, signOut, signUpAdmin } from '../services/firebase/auth';
import type { UserProfile } from '../types/auth';

const SESSION_KEY = '@kitchenos_user';

interface AuthState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;

  register: (email: string, password: string, displayName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setProfile: (profile: UserProfile | null) => void;
  /** Call once at app boot — restores cached session then wires Firebase listener */
  initialize: () => () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  loading: true,
  error: null,

  setProfile: (profile) => {
    set({ profile, loading: false });
    if (profile) {
      AsyncStorage.setItem(SESSION_KEY, JSON.stringify(profile)).catch(() => null);
    } else {
      AsyncStorage.removeItem(SESSION_KEY).catch(() => null);
    }
  },

  register: async (email, password, displayName) => {
    set({ loading: true, error: null });
    try {
      const profile = await signUpAdmin(email, password, displayName);
      set({ profile, loading: false });
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    } catch (err: unknown) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const profile = await signIn(email, password);
      set({ profile, loading: false });
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    } catch (err: unknown) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await signOut();
      await AsyncStorage.removeItem(SESSION_KEY);
      set({ profile: null, loading: false });
    } catch (err: unknown) {
      set({ error: errorMessage(err), loading: false });
      throw err;
    }
  },

  initialize: () => {
    // First: restore cached profile for instant UI (no flicker)
    AsyncStorage.getItem(SESSION_KEY)
      .then((raw) => {
        if (raw) {
          const cached = JSON.parse(raw) as UserProfile;
          // Only pre-populate if Firebase hasn't resolved yet
          set((s) => (s.profile ? s : { profile: cached, loading: true }));
        }
      })
      .catch(() => null);

    // Then: subscribe to Firebase auth for truth
    const unsubscribe = onAuthChanged((profile) => {
      set({ profile, loading: false });
      if (profile) {
        AsyncStorage.setItem(SESSION_KEY, JSON.stringify(profile)).catch(() => null);
      } else {
        AsyncStorage.removeItem(SESSION_KEY).catch(() => null);
      }
    });

    return unsubscribe;
  },

  clearError: () => set({ error: null }),
}));

// ---------------------------------------------------------------------------
// Selector hooks
// ---------------------------------------------------------------------------

export const useAuthLoading  = () => useAuthStore((s) => s.loading);
export const useCurrentUser  = () => useAuthStore((s) => s.profile);
export const useOwnerId      = () => useAuthStore((s) => s.profile?.ownerId ?? null);
export const useIsAdmin      = () => useAuthStore((s) => s.profile?.role === 'admin');

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
