import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface Analysis {
  id: string;
  content: string;
  timestamp: string;
  cost: number;
}

interface AnalysisStore {
  analyses: Analysis[];
  isAnalyzing: boolean;
  error: string | null;
  addAnalysis: (content: string, cost: number) => void;
  analyzeNews: (news: any[], apiKey: string, model: string, systemPrompt: string) => Promise<void>;
}

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set, get) => ({
      analyses: [],
      isAnalyzing: false,
      error: null,

      addAnalysis: (content, cost) => {
        const analysis = {
          id: Math.random().toString(36).substring(7),
          content,
          timestamp: new Date().toISOString(),
          cost
        };

        set((state) => ({
          analyses: [analysis, ...state.analyses].slice(0, 50) // Keep last 50 analyses
        }));
      },

      analyzeNews: async (news, apiKey, model, systemPrompt) => {
        set({ isAnalyzing: true, error: null });

        try {
          const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(news) }
              ],
              temperature: 0.7,
              max_tokens: 2000
            },
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const content = response.data.choices[0].message.content;
          const cost = 0.002 * (JSON.stringify(news).length / 1000); // Simplified cost calculation
          
          get().addAnalysis(content, cost);
          set({ isAnalyzing: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur d\'analyse',
            isAnalyzing: false 
          });
        }
      }
    }),
    {
      name: 'forex-analyses'
    }
  )
);