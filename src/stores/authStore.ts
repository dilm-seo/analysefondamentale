import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email) => set({ 
        user: { 
          email,
          name: email.split('@')[0]
        }
      }),
      logout: () => set({ user: null })
    }),
    {
      name: 'auth-storage'
    }
  )
);