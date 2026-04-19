import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Configuration
const LOCAL_DB_PATH = path.join(process.cwd(), 'data', 'snappnews.db');
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

async function migrate() {
  if (!TURSO_URL || !TURSO_TOKEN) {
    console.error('❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in environment');
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
    console.log('📰 Migrating Articles...');
    const articles = localDb.prepare('SELECT * FROM articles').all() as any[];
    for (const article of articles) {
      await remoteDb.execute({
        sql: 'INSERT OR IGNORE INTO articles (id, title, link, image, source, pubDate, bullets, category, lang, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [article.id, article.title, article.link, article.image, article.source, article.pubDate, article.bullets, article.category, article.lang, article.views]
      });
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
