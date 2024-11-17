import { dbService } from './database';
import { User, AdminStats } from '@/types';

export const adminService = {
  async getStats(): Promise<AdminStats> {
    try {
      const stats = await dbService.getStats();
      return {
        totalUsers: Number(stats.total_users),
        activeUsers: Number(stats.active_users),
        totalAnalyses: Number(stats.total_analyses),
        totalCosts: Number(stats.total_costs),
        subscriptionStats: {
          free: Number(stats.free_users),
          basic: Number(stats.basic_users),
          premium: Number(stats.premium_users)
        }
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw new Error('Failed to get stats');
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const users = await dbService.getAllUsers();
      return users.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role as 'user' | 'admin',
        subscription: user.subscription as 'free' | 'basic' | 'premium',
        createdAt: user.created_at?.toString(),
        lastLogin: user.last_login?.toString()
      }));
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error('Failed to get users');
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      await dbService.deleteUser(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }
};