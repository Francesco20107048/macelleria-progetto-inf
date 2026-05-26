// Script di avvio per produzione:
// - Fa il seed del database solo se è vuoto (prima volta)
// - Poi avvia il server Express

const db = require('./db/schema');
const { runSeed } = require('./db/seed');

const categorieCount = db.prepare('SELECT COUNT(*) as n FROM categories').get().n;

if (categorieCount === 0) {
  console.log('Database vuoto — eseguo il seed iniziale...');
  runSeed();
  console.log('Seed completato.');
} else {
  console.log(`Database già popolato (${categorieCount} categorie). Avvio diretto.`);
}

require('./index');
