import { useAnalysisStore } from '@/stores/analysisStore';
import { useAuthStore } from '@/stores/authStore';

export const analysisService = {
  saveAnalysis(content: string, model: string, cost: number) {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Non authentifié');

    useAnalysisStore.getState().addAnalysis({ content, model, cost });
  },

  getAnalyses() {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Non authentifié');

    return useAnalysisStore.getState().analyses;
  },

  checkAnalysisLimit() {
    const user = useAuthStore.getState().user;
    if (!user) return false;

    return useAnalysisStore.getState().checkDailyLimit();
  }
};