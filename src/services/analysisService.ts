import { useAuthStore } from '@/stores/authStore';

export const analysisService = {
  getAnalyses() {
    // Simplified version without database
    return [];
  },

  saveAnalysis(content: string, model: string, cost: number) {
    // Simplified version - just return the analysis object
    return {
      id: Math.random().toString(36).substr(2, 9),
      content,
      model,
      cost,
      createdAt: new Date().toISOString()
    };
  },

  checkAnalysisLimit() {
    // Simplified version - always allow analysis
    return true;
  }
};