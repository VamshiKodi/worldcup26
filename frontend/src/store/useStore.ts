import { create } from 'zustand';

/**
 * Root Zustand store. Phase 2/3/6 split this into slices:
 *  - authSlice (user, tokens, login/logout)
 *  - predictionSlice (draft picks, optimistic updates)
 *  - uiSlice (modals, reducedMotion)
 *  - simulatorSlice (run config, results)
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  reducedMotion: false,
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));
