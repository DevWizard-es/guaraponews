import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

// Configuration
const LOCAL_DB_PATH = path.join(process.cwd(), 'data', 'snappnews.db');
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

async function migrate() {
  if (!TURSO_URL || !TURSO_TOKEN) {
    console.error('❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env.local or environment');
    process.exit(1);
  }

  if (!fs.existsSync(LOCAL_DB_PATH)) {
    console.error(`❌ Error: Local database not found at ${LOCAL_DB_PATH}`);
    process.exit(1);
  }

  console.log('🚀 Starting migration from Local SQLite to Turso...');

  const localDb = new Database(LOCAL_DB_PATH);
  const remoteDb = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });

  try {
    // 0. Ensure Schema exists
    console.log('📐 Ensuring schema exists on Turso...');
    await remoteDb.executeMultiple(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        preferred_lang TEXT DEFAULT 'es'
      );
      CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        link TEXT UNIQUE NOT NULL,
        image TEXT,
        source TEXT,
        pubDate INTEGER,
        bullets TEXT,
        category TEXT,
        lang TEXT DEFAULT 'es',
        views INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS subscribers (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        created_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS user_interests (
        user_id TEXT,
        category TEXT,
        weight REAL,
        PRIMARY KEY (user_id, category),
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
      CREATE TABLE IF NOT EXISTS app_metadata (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    // 1. Migrate Users
    console.log('👥 Migrating Users...');
    const users = localDb.prepare('SELECT * FROM users').all() as any[];
    for (const user of users) {
      await remoteDb.execute({
        sql: 'INSERT OR IGNORE INTO users (id, username, password, preferred_lang) VALUES (?, ?, ?, ?)',
        args: [user.id, user.username, user.password, user.preferred_lang]
      });
    }

    // 2. Migrate Articles
    console.log('📰 Migrating Articles (in batches)...');
    const articles = localDb.prepare('SELECT * FROM articles').all() as any[];
    const BATCH_SIZE = 50;
    
    for (let i = 0; i < articles.length; i += BATCH_SIZE) {
      const batch = articles.slice(i, i + BATCH_SIZE);
      const statements = batch.map(article => ({
        sql: 'INSERT OR IGNORE INTO articles (id, title, link, image, source, pubDate, bullets, category, lang, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [article.id, article.title, article.link, article.image, article.source, article.pubDate, article.bullets, article.category, article.lang, article.views]
      }));
      
      await remoteDb.batch(statements, 'write');
      console.log(`   ✅ Synced ${Math.min(i + BATCH_SIZE, articles.length)}/${articles.length} articles`);
    }

    // 3. Migrate Subscribers
    console.log('📧 Migrating Subscribers...');
    const subscribers = localDb.prepare('SELECT * FROM subscribers').all() as any[];
    for (const sub of subscribers) {
      await remoteDb.execute({
        sql: 'INSERT OR IGNORE INTO subscribers (id, name, email, created_at) VALUES (?, ?, ?, ?)',
        args: [sub.id, sub.name, sub.email, sub.created_at]
      });
    }

    // 4. Migrate User Interests
    console.log('🎯 Migrating User Interests...');
    const interests = localDb.prepare('SELECT * FROM user_interests').all() as any[];
    for (const interest of interests) {
      await remoteDb.execute({
        sql: 'INSERT OR IGNORE INTO user_interests (user_id, category, weight) VALUES (?, ?, ?)',
        args: [interest.user_id, interest.category, interest.weight]
      });
    }

    // 5. Migrate App Metadata
    console.log('⚙️ Migrating App Metadata...');
    const metadata = localDb.prepare('SELECT * FROM app_metadata').all() as any[];
    for (const meta of metadata) {
      await remoteDb.execute({
        sql: 'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)',
        args: [meta.key, meta.value]
      });
    }

    console.log('✅ Migration COMPLETED successfully!');

  } catch (error) {
    console.error('❌ Migration FAILED:', error);
  } finally {
    localDb.close();
  }
}

migrate();
