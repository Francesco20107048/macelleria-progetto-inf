const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:3000']
  : ['http://localhost:3000'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Inizializza il database (crea le tabelle se non esistono)
require('./db/schema');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/products', require('./routes/reviews'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/shop-reviews', require('./routes/shopReviews'));
app.use('/api/contact', require('./routes/contacts'));
app.use('/api/seed', require('./routes/seed'));

// In produzione, serve il frontend React compilato
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  // Tutte le rotte non-API vanno a React Router
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server Il Macellaio di San Michele in ascolto sulla porta ${PORT}`);
});
