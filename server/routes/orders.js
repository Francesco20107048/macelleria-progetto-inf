const express = require('express');
const router = express.Router();
const db = require('../db/schema');

// POST /api/orders
router.post('/', (req, res) => {
  const {
    customer_name, customer_surname, email, address,
    city, zip, payment_method, total, items
  } = req.body;

  if (!customer_name || !customer_name.trim()) {
    return res.status(400).json({ error: 'Il nome è obbligatorio' });
  }
  if (!customer_surname || !customer_surname.trim()) {
    return res.status(400).json({ error: 'Il cognome è obbligatorio' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: "L'email è obbligatoria" });
  }
  if (!address || !address.trim()) {
    return res.status(400).json({ error: "L'indirizzo è obbligatorio" });
  }
  if (!city || !city.trim()) {
    return res.status(400).json({ error: 'La città è obbligatoria' });
  }
  if (!zip || !zip.trim()) {
    return res.status(400).json({ error: 'Il CAP è obbligatorio' });
  }
  if (!payment_method) {
    return res.status(400).json({ error: 'Il metodo di pagamento è obbligatorio' });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Il carrello è vuoto' });
  }

  // Verifica che tutti i product_id esistano prima di aprire la transazione
  for (const item of items) {
    const exists = db.prepare('SELECT id FROM products WHERE id = ?').get(item.product_id);
    if (!exists) {
      return res.status(400).json({ error: `Prodotto con id ${item.product_id} non trovato. Svuota il carrello e riprova.` });
    }
  }

  const orderCode = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

  // Transazione atomica: crea ordine + articoli
  const createOrder = db.transaction(() => {
    const orderResult = db.prepare(`
      INSERT INTO orders (order_code, customer_name, customer_surname, email, address, city, zip, payment_method, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(orderCode, customer_name.trim(), customer_surname.trim(), email.trim(),
           address.trim(), city.trim(), zip.trim(), payment_method, total);

    const orderId = orderResult.lastInsertRowid;

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity_kg, price_per_kg)
      VALUES (?, ?, ?, ?)
    `);

    for (const item of items) {
      insertItem.run(orderId, item.product_id, item.quantity_kg, item.price_per_kg);
    }

    return db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  });

  try {
    const order = createOrder();
    res.status(201).json(order);
  } catch (err) {
    console.error('Errore creazione ordine:', err.message);
    res.status(500).json({ error: 'Errore interno durante la creazione dell\'ordine' });
  }
});

// GET /api/orders?email=xxx  — storico ordini per email
router.get('/', (req, res) => {
  const { email } = req.query;
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Il parametro email è obbligatorio' });
  }

  const orders = db.prepare(
    'SELECT * FROM orders WHERE LOWER(email) = LOWER(?) ORDER BY created_at DESC'
  ).all(email.trim());

  const getItems = db.prepare(`
    SELECT oi.quantity_kg, oi.price_per_kg,
           p.id as product_id, p.name, p.image_url
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `);

  const result = orders.map((o) => ({
    ...o,
    items: getItems.all(o.id),
  }));

  res.json(result);
});

module.exports = router;
