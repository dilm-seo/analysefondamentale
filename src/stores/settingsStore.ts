import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  apiKey: string;
  model: string;
  systemPrompt: string;
  feeds: Array<{
    name: string;
    url: string;
    enabled: boolean;
  }>;
}

interface SettingsStore extends Settings {
  updateSettings: (settings: Partial<Settings>) => void;
  addFeed: (name: string, url: string) => void;
  removeFeed: (url: string) => void;
  toggleFeed: (url: string) => void;
}

const DEFAULT_SYSTEM_PROMPT = `Tu es un expert en trading Forex spécialisé dans l'analyse des actualités financières. Ta mission est de fournir des recommandations de trading précises et exploitables.

Format de réponse requis:

SYNTHÈSE DU MARCHÉ:
- Résumé bref des points clés des actualités

OPPORTUNITÉS DE TRADING:
1. [Paire de devises] - [Direction: ACHAT/VENTE]
   - Point d'entrée: [niveau]
   - Stop loss: [niveau]
   - Take profit: [niveau]
   - Ratio risque/rendement: [ratio]
   - Justification: [explication courte]

RISQUES PRINCIPAUX:
- Liste des risques majeurs à surveiller

HORIZON DE TRADING:
- Court terme (intraday/swing)`;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      apiKey: '',
      model: 'gpt-3.5-turbo',
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      feeds: [
        {
          name: 'ForexLive',
          url: 'https://www.forexlive.com/feed/news',
          enabled: true,
        }
      ],
      updateSettings: (newSettings) => set((state) => ({ ...state, ...newSettings })),
      addFeed: (name, url) => set((state) => ({
        ...state,
        feeds: [...state.feeds, { name, url, enabled: true }]
      })),
      removeFeed: (url) => set((state) => ({
        ...state,
        feeds: state.feeds.filter(feed => feed.url !== url)
      })),
      toggleFeed: (url) => set((state) => ({
        ...state,
        feeds: state.feeds.map(feed =>
          feed.url === url ? { ...feed, enabled: !feed.enabled } : feed
        )
      }))
    }),
    {
      name: 'forex-settings'
    }
  )
);