const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db/schema');

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Il nome è obbligatorio' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: "L'email è obbligatoria" });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: 'Formato email non valido' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'La password deve essere di almeno 6 caratteri' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const result = db.prepare(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
    ).run(name.trim(), email.trim().toLowerCase(), passwordHash);

    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessions (user_id, token) VALUES (?, ?)').run(result.lastInsertRowid, token);

    const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Questa email è già registrata' });
    }
    res.status(500).json({ error: 'Errore del server' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: "L'email è obbligatoria" });
  }
  if (!password) {
    return res.status(400).json({ error: 'La password è obbligatoria' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Email o password non corretti' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (user_id, token) VALUES (?, ?)').run(user.id, token);

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (token) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  res.json({ success: true });
});

// GET /api/auth/verify
router.get('/verify', (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Non autenticato' });

  const session = db.prepare(`
    SELECT s.token, u.id, u.name, u.email
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ?
  `).get(token);

  if (!session) return res.status(401).json({ error: 'Sessione non valida o scaduta' });

  res.json({ user: { id: session.id, name: session.name, email: session.email } });
});

module.exports = router;
