const express = require('express');
const router = express.Router();
const db = require('../db/schema');

// GET /api/products/:id/reviews
router.get('/:id/reviews', (req, res) => {
  const reviews = db.prepare(
    'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC'
  ).all(req.params.id);
  res.json(reviews);
});

// POST /api/products/:id/reviews
router.post('/:id/reviews', (req, res) => {
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

  const prodotto = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!prodotto) {
    return res.status(404).json({ error: 'Prodotto non trovato' });
  }

  const result = db.prepare(
    'INSERT INTO reviews (product_id, author, rating, comment) VALUES (?, ?, ?, ?)'
  ).run(req.params.id, author.trim(), Number(rating), comment.trim());

  const nuovaRecensione = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(nuovaRecensione);
});

module.exports = router;
