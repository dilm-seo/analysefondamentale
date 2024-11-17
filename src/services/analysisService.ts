import { dbService } from './database';
import { useAuthStore } from '@/stores/authStore';

export const analysisService = {
  async saveAnalysis(content: string, model: string, cost: number) {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Non authentifié');

    return dbService.saveAnalysis(user.id, content, model, cost);
  },

  async getAnalyses() {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Non authentifié');

    return dbService.getAnalyses(user.id);
  },

  async checkAnalysisLimit() {
    const user = useAuthStore.getState().user;
    if (!user) return false;

    const count = await dbService.getDailyAnalysisCount(user.id);
    return count < 5;
  }
};