import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'snappnews.db');

// Ensure data directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Turso client (Serverless ready)
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || `file:${dbPath}`,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Initialize Tables (Async)
async function initDb() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT,
      link TEXT UNIQUE,
      image TEXT,
      source TEXT,
      pubDate INTEGER,
      bullets TEXT,
      category TEXT,
      lang TEXT,
      views INTEGER DEFAULT 0
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      created_at INTEGER
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      preferred_lang TEXT DEFAULT 'es'
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS user_interests (
      user_id TEXT,
      category TEXT,
      weight INTEGER DEFAULT 1,
      PRIMARY KEY (user_id, category),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

// Perform initialization on startup
initDb().catch(console.error);

export async function getLastUpdate(): Promise<number> {
  try {
    const rs = await client.execute("SELECT value FROM app_metadata WHERE key = 'last_ingestion'");
    const row = rs.rows[0];
    return row ? Number(row.value) : 0;
  } catch {
    return 0;
  }
}

export async function setLastUpdate(time: number) {
  await client.execute({
    sql: "INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('last_ingestion', ?)",
    args: [String(time)]
  });
}

export async function incrementViews(id: string) {
  await client.execute({
    sql: "UPDATE articles SET views = views + 1 WHERE id = ?",
    args: [id]
  });
}

export async function getTrends(limit = 7, lang = 'es'): Promise<string[]> {
  const rs = await client.execute({
    sql: "SELECT title, views FROM articles WHERE lang = ? ORDER BY pubDate DESC LIMIT 200",
    args: [lang]
  });
  const rows = rs.rows;
  
  const stopWords = new Set([
     'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'y', 'o', 'pero', 'si', 'no', 'en', 'con', 'por', 'para', 'como', 'su', 'sus', 'lo', 'esto', 'que', 'qué', 'este', 'esta', 'estos', 'estas', 'son', 'han', 'hay', 'ser', 'fue', 'era', 'muy', 'donde', 'cuando', 'quien', 'quienes', 'todo', 'todos', 'toda', 'todas', 'sobre', 'bajo', 'entre', 'hacia', 'hasta', 'desde', 'para', 'por', 'durante', 'mejor', 'peor', 'antes', 'despues', 'después', 'solo', 'sólo', 'aquí', 'alli', 'allí', 'nuevo', 'nueva', 'nuevos', 'nuevas', 'más', 'mas', 'años', 'cómo', 'como', 'según', 'está', 'están', 'estábamos', 'había', 'habían', 'tenía', 'tenían', 'puede', 'pueden', 'será', 'serán', 'así', 'donde', 'gran', 'mismo', 'misma',
    'the', 'and', 'for', 'with', 'from', 'new', 'how', 'why', 'what', 'best', 'top', 'pro', 'more', 'about', 'after', 'before', 'this', 'that', 'they', 'them', 'their', 'your', 'will', 'have', 'been', 'were', 'also', 'some', 'could', 'should', 'more', 'than', 'when', 'where', 'which'
  ]);
  
  const scores: Record<string, number> = {};
  rows.forEach(row => {
    const title = String(row.title);
    const views = Number(row.views || 0);
    const words = title.toLowerCase().match(/\p{L}{3,}/gu) || [];
    const weight = 1 + Math.log10(views + 1);
    
    words.forEach((w: string) => {
      if (!stopWords.has(w)) {
        scores[w] = (scores[w] || 0) + weight;
      }
    });
  });

  return Object.entries(scores)
    .filter(([_, score]) => score >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, limit);
}

export interface Article {
  id: string;
  title: string;
  link: string;
  image: string;
  source: string;
  pubDate: number;
  bullets: string[];
  category: string;
  lang: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  preferred_lang?: string;
}

export async function saveSubscriber(name: string, email: string) {
  await client.execute({
    sql: "INSERT INTO subscribers (name, email, created_at) VALUES (?, ?, ?)",
    args: [name, email, Date.now()]
  });
}

export async function getArticles(page = 1, limit = 12, categories: string[] = [], lang = 'es', userId?: string, search?: string): Promise<Article[]> {
  let query = '';
  const args: any[] = [];
  const whereClauses = [];
  
  if (categories.length > 0 && categories[0] !== 'Todas') {
    const placeholders = categories.map(() => '?').join(',');
    whereClauses.push(`category IN (${placeholders})`);
    args.push(...categories);
  }

  if (search && search !== 'Análisis') {
    whereClauses.push(`title LIKE ?`);
    args.push(`%${search}%`);
  }

  if (userId) {
    query = `
      SELECT a.*, COALESCE(ui.weight, 1) as interest_weight
      FROM articles a
      LEFT JOIN user_interests ui ON a.category = ui.category AND ui.user_id = ?
    `;
    args.unshift(userId);
  } else {
    query = 'SELECT *, 1 as interest_weight FROM articles';
  }

  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }

  const isTopMode = categories.includes('Análisis') || search === 'Análisis';
  let orderBy = '';
  if (isTopMode) {
    orderBy = `views DESC, (CASE WHEN title LIKE '%Análisis%' OR title LIKE '%Review%' THEN 5 ELSE 0 END) DESC, pubDate DESC`;
  } else {
    const langWeight = `(CASE WHEN lang = ? THEN 10 ELSE 0 END)`;
    args.push(lang);
    orderBy = `${userId ? 'interest_weight DESC,' : ''} ${langWeight} DESC, pubDate DESC`;
  }

  query += ` ORDER BY ${orderBy}, id ASC LIMIT ? OFFSET ?`;
  args.push(limit, (page - 1) * limit);

  const rs = await client.execute({ sql: query, args });
  return rs.rows.map(row => ({
    ...row,
    bullets: JSON.parse(String(row.bullets || '[]'))
  })) as any;
}

export async function saveArticle(article: Article) {
  await client.execute({
    sql: `INSERT OR IGNORE INTO articles (id, title, link, image, source, pubDate, bullets, category, lang) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      article.id,
      article.title, 
      article.link, 
      article.image, 
      article.source, 
      article.pubDate, 
      JSON.stringify(article.bullets), 
      article.category, 
      article.lang
    ]
  });
}

export async function trackClick(userId: string, category: string) {
  await client.execute({
    sql: "INSERT INTO user_interests (user_id, category, weight) VALUES (?, ?, 5) ON CONFLICT(user_id, category) DO UPDATE SET weight = weight + 2",
    args: [userId, category]
  });
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const rs = await client.execute({
    sql: "SELECT * FROM users WHERE username = ?",
    args: [username]
  });
  if (rs.rows.length === 0) return null;
  const row = rs.rows[0];
  return {
    id: String(row.id),
    username: String(row.username),
    password: String(row.password),
    preferred_lang: String(row.preferred_lang || 'es')
  };
}

export async function createUser(user: User) {
  await client.execute({
    sql: "INSERT INTO users (id, username, password, preferred_lang) VALUES (?, ?, ?, ?)",
    args: [user.id, user.username, user.password, user.preferred_lang || 'es']
  });
}

export async function deleteOldArticles(days = 3) {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  const info = await client.execute({
    sql: 'DELETE FROM articles WHERE pubDate < ?',
    args: [cutoff]
  });
  console.log(`Mantenimiento Automático: Eliminados ${info.rowsAffected} artículos antiguos.`);
}

export default client;
