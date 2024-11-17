export interface FeedSource {
  name: string;
  url: string;
  enabled: boolean;
}

export interface NewsItem {
  source: string;
  title: string;
  description: string;
  pubDate: string;
  link: string;
}

export interface Settings {
  theme: 'light' | 'dark';
  language: 'fr' | 'en';
  emailNotifications: boolean;
  analysisFormat: 'html' | 'markdown' | 'text';
  apiKey?: string;
  systemPrompt?: string;
}