import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateSettings: (settings: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Simuler un délai d'authentification
          await new Promise(resolve => setTimeout(resolve, 1000));

          set({
            user: {
              id: Math.random().toString(36).substr(2, 9),
              email,
              username: email.split('@')[0],
              role: email.includes('admin') ? 'admin' : 'user',
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur de connexion',
            isLoading: false 
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
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
      version: 1,
    }
  )
);