const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(process.cwd(), 'data', 'snappnews.db');
const db = new Database(dbPath);

const stmt = db.prepare("DELETE FROM articles WHERE category='IA' AND (image LIKE '%unsplash%' OR image = '' OR image IS NULL)");
const info = stmt.run();
console.log(`IA Cleanup: Se han eliminado ${info.changes} artículos con imágenes rotas/fallbacks.`);
