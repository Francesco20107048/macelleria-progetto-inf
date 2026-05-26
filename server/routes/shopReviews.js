const express = require('express');
const router = express.Router();
const db = require('../db/schema');

// GET /api/shop-reviews
router.get('/', (req, res) => {
  const reviews = db.prepare(
    'SELECT * FROM shop_reviews ORDER BY created_at DESC'
  ).all();
  res.json(reviews);
});

// POST /api/shop-reviews
router.post('/', (req, res) => {
  const { author, rating, comment } = req.body;

  if (!author || !author.trim()) {
    return res.status(400).json({ error: 'Il nome è obbligatorio' });
  }
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'La valutazione deve essere tra 1 e 5' });
  }
  if (!comment || !comment.trim()) {
    return res.status(400).json({ error: 'Il commento è obbligatorio' });
  }

  const result = db.prepare(
    'INSERT INTO shop_reviews (author, rating, comment) VALUES (?, ?, ?)'
  ).run(author.trim(), Number(rating), comment.trim());

  const nuovaRecensione = db.prepare('SELECT * FROM shop_reviews WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(nuovaRecensione);
});

module.exports = router;
