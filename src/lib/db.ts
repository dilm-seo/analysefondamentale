import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let db: Database.Database;

// Ensure the database directory exists in production
if (process.env.NODE_ENV === 'production') {
  const dbDir = path.dirname(process.env.DATABASE_PATH || '/tmp/forex_analyzer.db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

// Initialize database connection
if (process.env.NODE_ENV === 'production') {
  db = new Database(process.env.DATABASE_PATH || '/tmp/forex_analyzer.db', {
    verbose: console.log
  });
} else {
  if (!(global as any).db) {
    (global as any).db = new Database(':memory:', {
      verbose: console.log
    });
    initializeDatabase((global as any).db);
  }
  db = (global as any).db;
}

function initializeDatabase(database: Database.Database) {
  database.pragma('journal_mode = WAL');
  database.pragma('synchronous = NORMAL');
  
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      subscription TEXT DEFAULT 'free',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_login TEXT
    );

    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      model TEXT NOT NULL,
      cost REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      theme TEXT DEFAULT 'dark',
      language TEXT DEFAULT 'fr',
      email_notifications INTEGER DEFAULT 1,
      analysis_format TEXT DEFAULT 'html',
      api_key TEXT,
      system_prompt TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS feeds (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT UNIQUE NOT NULL,
      enabled INTEGER DEFAULT 1
    );

    -- Insert default feeds if none exist
    INSERT OR IGNORE INTO feeds (id, name, url, enabled)
    VALUES 
      ('1', 'ForexLive', 'https://www.forexlive.com/feed/news', 1),
      ('2', 'DailyFX', 'https://www.dailyfx.com/feeds/market-news', 1);
  `);
}

// Initialize database schema for production
if (process.env.NODE_ENV === 'production') {
  initializeDatabase(db);
}

export default db;