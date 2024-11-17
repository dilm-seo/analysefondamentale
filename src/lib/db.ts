import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';

// Initialize database connection
export const db = drizzle(sql);

// Initialize database schema
export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        subscription TEXT DEFAULT 'free',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        model TEXT NOT NULL,
        cost REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        theme TEXT DEFAULT 'dark',
        language TEXT DEFAULT 'fr',
        email_notifications BOOLEAN DEFAULT true,
        analysis_format TEXT DEFAULT 'html',
        api_key TEXT,
        system_prompt TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS feeds (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT UNIQUE NOT NULL,
        enabled BOOLEAN DEFAULT true
      );
    `;

    // Insert default feeds if none exist
    await sql`
      INSERT INTO feeds (id, name, url, enabled)
      VALUES 
        ('1', 'ForexLive', 'https://www.forexlive.com/feed/news', true),
        ('2', 'DailyFX', 'https://www.dailyfx.com/feeds/market-news', true)
      ON CONFLICT (url) DO NOTHING;
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Initialize database on import
initializeDatabase().catch(console.error);