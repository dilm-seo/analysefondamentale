import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AnalysisRecord {
  id: string;
  content: string;
  timestamp: string;
  cost: number;
  model: string;
}

interface HistoryState {
  analyses: AnalysisRecord[];
  addAnalysis: (analysis: Omit<AnalysisRecord, 'id' | 'timestamp'>) => void;
  deleteAnalysis: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      analyses: [],
      
      addAnalysis: (analysis) => set((state) => ({
        analyses: [
          {
            ...analysis,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString()
          },
          ...state.analyses
        ].slice(0, 100) // Garder seulement les 100 dernières analyses
      })),
      
      deleteAnalysis: (id) => set((state) => ({
        analyses: state.analyses.filter(a => a.id !== id)
      })),
      
      clearHistory: () => set({ analyses: [] })
    }),
    {
      name: 'forex-analysis-history'
    }
  )
);