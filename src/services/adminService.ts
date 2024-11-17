// Simplified version without database dependency
import { AdminStats } from '@/types';

export const adminService = {
  getStats(): AdminStats {
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalAnalyses: 0,
      totalCosts: 0,
      subscriptionStats: {
        free: 0,
        basic: 0,
        premium: 0,
        enterprise: 0
      }
    };
  },

  getAllUsers() {
    return [];
  },

  deleteUser() {
    // Simplified version
    return Promise.resolve();
  }
};