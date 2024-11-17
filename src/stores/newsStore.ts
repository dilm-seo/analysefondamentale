import { create } from 'zustand';
import axios from 'axios';

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
  fetchNews: () => Promise<void>;
}

export const useNewsStore = create<NewsState>((set) => ({
  news: [],
  isLoading: false,
  error: null,
  fetchNews: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('https://www.forexlive.com/feed/news');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data, 'text/xml');
      const items = Array.from(xmlDoc.querySelectorAll('item'));

      const news = items.map((item) => ({
        source: 'ForexLive',
        title: item.querySelector('title')?.textContent || '',
        description: item.querySelector('description')?.textContent || '',
        pubDate: item.querySelector('pubDate')?.textContent || '',
        link: item.querySelector('link')?.textContent || '',
      }));

      set({ news, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch news', isLoading: false });
    }
  },
}));