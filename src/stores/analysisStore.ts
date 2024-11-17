import create from 'zustand';
import { persist } from 'zustand/middleware';

interface Analysis {
  id: string;
  content: string;
  model: string;
  cost: number;
  createdAt: string;
}

interface AnalysisState {
  analyses: Analysis[];
  dailyCount: number;
  lastCountReset: string;
  addAnalysis: (analysis: Omit<Analysis, 'id' | 'createdAt'>) => void;
  checkDailyLimit: () => boolean;
  resetDailyCount: () => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      analyses: [],
      dailyCount: 0,
      lastCountReset: new Date().toDateString(),

      addAnalysis: (analysis) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
          analyses: [
            {
              ...analysis,
              id,
              createdAt: new Date().toISOString(),
            },
            ...state.analyses,
          ],
          dailyCount: state.dailyCount + 1,
        }));
      },

      checkDailyLimit: () => {
        const { dailyCount, lastCountReset } = get();
        const today = new Date().toDateString();

        if (lastCountReset !== today) {
          set({ dailyCount: 0, lastCountReset: today });
          return true;
        }

        return dailyCount < 5;
      },

      resetDailyCount: () => {
        set({
          dailyCount: 0,
          lastCountReset: new Date().toDateString(),
        });
      },
    }),
    {
      name: 'analysis-storage',
    }
  )
);