import { useAuthStore } from '@/stores/authStore';
import { useAnalysisStore } from '@/stores/analysisStore';
import { AdminStats } from '@/types';

export const adminService = {
  getStats(): AdminStats {
    const analyses = useAnalysisStore.getState().analyses;
    const totalCosts = analyses.reduce((sum, a) => sum + a.cost, 0);

    return {
      totalUsers: 1,
      activeUsers: 1,
      totalAnalyses: analyses.length,
      totalCosts,
      subscriptionStats: {
        free: 1,
        basic: 0,
        premium: 0,
        enterprise: 0
      }
    };
  },

  getAllUsers() {
    const user = useAuthStore.getState().user;
    if (!user) return [];
    
    return [{
      id: '1',
      email: user.email,
      username: user.name,
      role: 'user',
      subscription: 'free'
    }];
  },

  deleteUser() {
    useAuthStore.getState().logout();
  }
};