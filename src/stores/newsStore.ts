import create from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface FeedSource {
  name: string;
  url: string;
  enabled: boolean;
}

interface NewsItem {
  source: string;
  title: string;
  description: string;
  pubDate: string;
  link: string;
}

interface NewsState {
  feeds: FeedSource[];
  news: NewsItem[];
  isLoading: boolean;
  error: string | null;
  addFeed: (feed: FeedSource) => void;
  removeFeed: (url: string) => void;
  toggleFeed: (url: string) => void;
  fetchNews: () => Promise<void>;
}

export const useNewsStore = create<NewsState>()(
  persist(
    (set, get) => ({
      feeds: [
        {
          name: 'ForexLive',
          url: 'https://www.forexlive.com/feed/news',
          enabled: true,
        },
      ],
      news: [],
      isLoading: false,
      error: null,

      addFeed: (feed) => {
        set((state) => ({
          feeds: [...state.feeds, feed],
        }));
      },

      removeFeed: (url) => {
        set((state) => ({
          feeds: state.feeds.filter((f) => f.url !== url),
        }));
      },

      toggleFeed: (url) => {
        set((state) => ({
          feeds: state.feeds.map((f) =>
            f.url === url ? { ...f, enabled: !f.enabled } : f
          ),
        }));
      },

      fetchNews: async () => {
        set({ isLoading: true, error: null });
        try {
          const feeds = get().feeds.filter((f) => f.enabled);
          
          const newsPromises = feeds.map(async (feed) => {
            try {
              const response = await axios.get(feed.url, {
                timeout: 10000,
                headers: {
                  'Accept': 'application/rss+xml, application/xml, text/xml',
                },
              });

              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(response.data, 'text/xml');
              const items = Array.from(xmlDoc.querySelectorAll('item'));

              return items.map((item) => ({
                source: feed.name,
                title: item.querySelector('title')?.textContent || '',
                description: item.querySelector('description')?.textContent || '',
                pubDate: item.querySelector('pubDate')?.textContent || '',
                link: item.querySelector('link')?.textContent || '',
              }));
            } catch (error) {
              console.error(`Error fetching ${feed.name}:`, error);
              return [];
            }
          });

          const allNews = (await Promise.all(newsPromises))
            .flat()
            .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
            .slice(0, 100);

          set({ news: allNews, isLoading: false });
        } catch (error) {
          set({
            error: 'Failed to fetch news',
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'news-storage',
    }
  )
);