// Simplified version without database
export const adminService = {
  getStats() {
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
    return Promise.resolve();
  }
};