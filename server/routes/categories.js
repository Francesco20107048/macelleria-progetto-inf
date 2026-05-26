const express = require('express');
const router = express.Router();
const db = require('../db/schema');

// GET /api/categories
router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json(categories);
});

module.exports = router;
