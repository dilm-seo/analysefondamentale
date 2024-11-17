import create from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

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
            id: Math.random().toString(36).substr(2, 9),
            email,
            username: email.split('@')[0],
            role: email.includes('admin') ? 'admin' : 'user',
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