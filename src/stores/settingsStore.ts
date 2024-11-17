import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Feed {
  name: string;
  url: string;
  enabled: boolean;
}

interface Settings {
  apiKey: string;
  model: string;
  systemPrompt: string;
  feeds: Feed[];
}

interface SettingsStore extends Settings {
  updateSettings: (settings: Partial<Settings>) => void;
  addFeed: (name: string, url: string) => void;
  removeFeed: (url: string) => void;
  toggleFeed: (url: string) => void;
}

const DEFAULT_SYSTEM_PROMPT = `Je suis une IA spécialisée dans l'analyse des marchés et la génération d'opportunités de trading basées uniquement sur l'analyse fondamentale des données réelles. Mon processus suit une méthodologie stricte et structurée pour garantir la qualité et l'exhaustivité des analyses :

Identifie et analyse les 15 news les plus importantes publiées impactantant fortement le cours des devises

Tu dois identifier 3 types d'opportunités (court, moyen et long terme)

Voici ce que tu dois me donner pour chaque opportunité:

💱Paire concernées:
🔵🔴 Sentiment: (Haussier ou baissier pour ...)
🔥 Puissance du Signal: 🔥 (faible) ou 🔥🔥 (moyen) ou 🔥🔥🔥 (fort)
❓ Pourquoi haussier/Baissier ?
⌚ Heure des news
🌐 Les 3 News qui appuient le plus ton analyse trouvés sur les liens feed de tes consignes (précise les dates et heures)
❓ Y a-t-il des nouvelles contradictoires ?

Disclamer: Les analyses et recommandations fournies sont basées uniquement sur l'analyse fondamentale des actualités et ne constituent pas des conseils financiers. Le trading comporte des risques, effectuez toujours vos propres recherches avant de prendre une décision d'investissement.`;

const DEFAULT_FEEDS = [
  {
    name: 'ForexLive',
    url: 'https://www.forexlive.com/feed/news',
    enabled: true,
  },
  {
    name: 'Investing.com',
    url: 'https://www.investing.com/rss/news.rss',
    enabled: true,
  }
];

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      apiKey: '',
      model: 'gpt-3.5-turbo',
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      feeds: DEFAULT_FEEDS,
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
      name: 'forex-settings',
      version: 1
    }
  )
);