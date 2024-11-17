import { create } from 'zustand';
import axios from 'axios';
import { decode } from 'html-entities';
import { useSettingsStore } from './settingsStore';
import toast from 'react-hot-toast';

interface NewsItem {
  source: string;
  title: string;
  description: string;
  pubDate: string;
  link: string;
}

interface NewsState {
  news: NewsItem[];
  isLoading: boolean;
  error: string | null;
  limit: number;
  setLimit: (limit: number) => void;
  fetchNews: () => Promise<void>;
}

// Nettoie le HTML et décode les entités
const cleanText = (text: string): string => {
  if (!text) return '';
  // Enlève les balises HTML
  const withoutTags = text.replace(/<[^>]*>/g, ' ');
  // Décode les entités HTML
  const decoded = decode(withoutTags);
  // Nettoie les espaces multiples
  return decoded.replace(/\s+/g, ' ').trim();
};

// Tronque le texte à 300 caractères
const truncateText = (text: string, maxLength: number = 300): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

// Parse le XML RSS avec gestion de différents formats
async function parseRssFeed(url: string, sourceName: string): Promise<NewsItem[]> {
  try {
    // Utiliser un proxy CORS pour contourner les restrictions
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const response = await axios.get(proxyUrl + encodeURIComponent(url), {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
      },
      timeout: 10000
    });

    const parser = new window.DOMParser();
    const xmlDoc = parser.parseFromString(response.data, 'text/xml');

    // Gérer les erreurs de parsing XML
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error(`Format XML invalide pour ${sourceName}`);
    }

    // Essayer différents sélecteurs pour les items
    let items = Array.from(xmlDoc.querySelectorAll('item'));
    if (items.length === 0) {
      items = Array.from(xmlDoc.querySelectorAll('entry')); // Pour les flux Atom
    }

    return items.map(item => {
      // Récupérer le titre
      const title = cleanText(
        item.querySelector('title')?.textContent ||
        item.querySelector('media\\:title')?.textContent ||
        'Sans titre'
      );

      // Récupérer la description
      let description = cleanText(
        item.querySelector('description')?.textContent ||
        item.querySelector('content\\:encoded')?.textContent ||
        item.querySelector('content')?.textContent ||
        item.querySelector('summary')?.textContent ||
        'Pas de description'
      );

      // Pour Investing.com, extraire le texte utile
      if (url.includes('investing.com')) {
        description = description.split('<br/>')[0] || description;
      }

      // Récupérer la date
      const pubDate = item.querySelector('pubDate')?.textContent ||
                     item.querySelector('published')?.textContent ||
                     item.querySelector('updated')?.textContent ||
                     new Date().toISOString();

      // Récupérer le lien
      const link = item.querySelector('link')?.textContent ||
                  item.querySelector('link')?.getAttribute('href') ||
                  '#';

      return {
        source: sourceName,
        title: truncateText(title),
        description: truncateText(description),
        pubDate,
        link
      };
    });
  } catch (error) {
    console.error(`Erreur lors de la lecture du flux ${sourceName}:`, error);
    toast.error(`Erreur lors de la lecture du flux ${sourceName}`);
    return [];
  }
}

export const useNewsStore = create<NewsState>((set) => ({
  news: [],
  isLoading: false,
  error: null,
  limit: 10,
  setLimit: (limit) => set({ limit }),
  fetchNews: async () => {
    set({ isLoading: true, error: null });
    try {
      // Récupérer les feeds activés depuis le store des paramètres
      const feeds = useSettingsStore.getState().feeds.filter(feed => feed.enabled);
      
      if (feeds.length === 0) {
        throw new Error('Aucune source d\'actualités activée');
      }

      // Récupérer les actualités de chaque feed en série pour éviter les erreurs de mémoire
      const allNews: NewsItem[] = [];
      for (const feed of feeds) {
        try {
          const newsItems = await parseRssFeed(feed.url, feed.name);
          allNews.push(...newsItems);
        } catch (error) {
          console.error(`Erreur pour ${feed.name}:`, error);
        }
      }

      // Trier par date et filtrer les items invalides
      const sortedNews = allNews
        .filter(item => item.title && item.description)
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

      set({ news: sortedNews, isLoading: false });
    } catch (error) {
      console.error('Error fetching news:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des actualités',
        isLoading: false,
        news: []
      });
    }
  }
}));