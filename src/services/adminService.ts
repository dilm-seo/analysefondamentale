import { dbService } from './database';
import { User } from '@/types';

export const adminService = {
  async getStats() {
    try {
      return await dbService.getStats();
    } catch (error) {
      console.error('Error getting stats:', error);
      throw new Error('Failed to get stats');
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      return await dbService.getAllUsers();
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