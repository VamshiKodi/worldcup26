import { create } from 'zustand';
import { api } from '../lib/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: 'idle' | 'loading' | 'authed' | 'guest';
  setSession: (user: AuthUser, accessToken: string) => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  loadMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  status: 'idle',

  setSession: (user, accessToken) => set({ user, accessToken, status: 'authed' }),

  register: async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    get().setSession(data.data.user, data.data.accessToken);
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    get().setSession(data.data.user, data.data.accessToken);
  },

  loginWithGoogle: async (credential) => {
    const { data } = await api.post('/auth/google', { credential });
    get().setSession(data.data.user, data.data.accessToken);
  },

  // Called on app boot: tries to silently restore a session via the refresh cookie.
  loadMe: async () => {
    set({ status: 'loading' });
    try {
      const { data } = await api.post('/auth/refresh');
      get().setSession(data.data.user, data.data.accessToken);
    } catch {
      set({ user: null, accessToken: null, status: 'guest' });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      set({ user: null, accessToken: null, status: 'guest' });
    }
  },
}));
