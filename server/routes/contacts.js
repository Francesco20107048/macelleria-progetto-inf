const express = require('express');
const router = express.Router();
const db = require('../db/schema');

// POST /api/contact
router.post('/', (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Il nome è obbligatorio' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: "L'email è obbligatoria" });
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Il messaggio è obbligatorio' });
  }

  db.prepare(
    'INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)'
  ).run(name.trim(), email.trim(), phone ? phone.trim() : null, message.trim());

  res.status(201).json({ success: true, messaggio: 'Messaggio ricevuto con successo' });
});

module.exports = router;
