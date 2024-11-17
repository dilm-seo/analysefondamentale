import { db } from '@/lib/db';

export const authService = {
  async login(email: string, password: string) {
    // Simplified auth for demo
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      username: email.split('@')[0],
      role: email.includes('admin') ? 'admin' : 'user'
    };

    return { user };
  },

  async register(email: string, password: string) {
    // Simplified registration for demo
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      username: email.split('@')[0],
      role: 'user'
    };

    return { user };
  }
};