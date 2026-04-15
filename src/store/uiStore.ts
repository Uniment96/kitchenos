import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  message: string;
  type: ToastType;
  id: number;
}

interface UIState {
  toast: Toast | null;
  isOnline: boolean;

  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  setOnline: (online: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  toast: null,
  isOnline: true,

  showToast: (message, type = 'info') => {
    const id = Date.now();
    set({ toast: { message, type, id } });
    // Auto-dismiss after 3 s
    setTimeout(() => {
      set((s) => (s.toast?.id === id ? { toast: null } : s));
    }, 3000);
  },

  hideToast: () => set({ toast: null }),

  setOnline: (isOnline) => set({ isOnline }),
}));
