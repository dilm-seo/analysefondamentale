// Simplified version without database dependency
import { useAuthStore } from '@/stores/authStore';

export const analysisService = {
  getAnalyses() {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Non authentifié');
    return [];
  },

  checkAnalysisLimit() {
    const user = useAuthStore.getState().user;
    return !!user;
  }
};