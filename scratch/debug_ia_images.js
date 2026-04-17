const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(process.cwd(), 'data', 'snappnews.db');
const db = new Database(dbPath);

const iaArticles = db.prepare('SELECT title, image, source FROM articles WHERE category = ? LIMIT 20').all('IA');
console.log('--- IA Image URLs ---');
iaArticles.forEach(a => {
  console.log(`[${a.source}] ${a.title}`);
  console.log(`URL: ${a.image}\n`);
});
