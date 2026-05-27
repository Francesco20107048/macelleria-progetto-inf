const db = require('../db/schema');

function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!token) return res.status(401).json({ error: 'Non autenticato' });

  const session = db.prepare(`
    SELECT u.id, u.name, u.email
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ?
  `).get(token);

  if (!session) return res.status(401).json({ error: 'Sessione non valida o scaduta' });

  req.user = session;
  next();
}

module.exports = requireAuth;
