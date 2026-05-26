const express = require('express');
const router = express.Router();
const db = require('../db/schema');

// GET /api/products
// Query params: ?category=slug, ?search=testo, ?featured=1
router.get('/', (req, res) => {
  const { category, search, featured } = req.query;

  let sql = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    sql += ' AND c.slug = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (featured === '1') {
    sql += ' AND p.featured = 1';
  }

  sql += ' ORDER BY p.name';

  const products = db.prepare(sql).all(...params);
  res.json(products);
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Prodotto non trovato' });
  }
  res.json(product);
});

module.exports = router;
