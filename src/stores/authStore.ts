import create from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  email: string;
  name: string;
  apiKey?: string;
  systemPrompt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  updateSettings: (settings: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (email: string) => {
        set({
          user: {
            email,
            name: email.split('@')[0],
          },
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      updateSettings: (settings) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...settings } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);