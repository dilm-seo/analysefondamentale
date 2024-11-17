export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  subscription?: 'free' | 'basic' | 'premium';
  createdAt?: string;
  lastLogin?: string;
}

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

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalAnalyses: number;
  totalCosts: number;
  freeUsers: number;
  basicUsers: number;
  premiumUsers: number;
}