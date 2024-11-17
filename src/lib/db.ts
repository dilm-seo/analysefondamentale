import Database from 'better-sqlite3';
import { join } from 'path';

let db: Database.Database;

if (process.env.NODE_ENV === 'production') {
  db = new Database(process.env.DATABASE_PATH || ':memory:');
} else {
  if (!(global as any).db) {
    (global as any).db = new Database(':memory:');
  }
  db = (global as any).db;
}

// Initialize database schema
db.exec(`
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
`);

export default db;