const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(process.cwd(), 'data', 'snappnews.db');
const db = new Database(dbPath);

const categories = db.prepare('SELECT category, count(*) as count FROM articles GROUP BY category').all();
console.log('--- Category Counts ---');
categories.forEach(c => console.log(`${c.category}: ${c.count}`));

const iaSamples = db.prepare('SELECT title FROM articles WHERE category = ? LIMIT 5').all('IA');
console.log('\n--- IA Samples ---');
iaSamples.forEach(s => console.log(`- ${s.title}`));
