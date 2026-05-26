const express = require('express');
const router = express.Router();
const { runSeed } = require('../db/seed');

// POST /api/seed?secret=LA_TUA_CHIAVE
// Protetto da SEED_SECRET (variabile d'ambiente). Non esporre mai senza chiave.
router.post('/', (req, res) => {
  const secret = req.query.secret || req.headers['x-seed-secret'];
  const expected = process.env.SEED_SECRET;

  if (!expected) {
    return res.status(500).json({ error: 'SEED_SECRET non configurato sul server.' });
  }

  if (secret !== expected) {
    return res.status(403).json({ error: 'Chiave non valida.' });
  }

  try {
    runSeed();
    res.json({ ok: true, message: 'Database seedato con successo!' });
  } catch (err) {
    console.error('Errore durante il seed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
