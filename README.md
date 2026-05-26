# Il Macellaio di San Michele

Progetto scolastico — Web app e-commerce fullstack per una macelleria napoletana.
Il pagamento e simulato: nessuna transazione reale viene effettuata.

---

## Stack tecnologico

| Layer    | Tecnologia |
|----------|-----------|
| Frontend | React 19, React Router v6, Tailwind CSS v3, Context API |
| Backend  | Node.js, Express 5, better-sqlite3 |
| Database | SQLite (file locale) |

---

## Struttura progetto

```
macelleria-progetto-inf/
├── src/                      ← Client React (Vite)
│   ├── api/api.js             ← Tutte le fetch centralizzate
│   ├── context/CartContext.jsx
│   ├── hooks/
│   │   ├── useProducts.js
│   │   └── useCart.js
│   ├── components/
│   │   ├── layout/  → Header.jsx, Footer.jsx
│   │   └── ui/      → Button, StarRating, ProductCard,
│   │                   CategoryCard, Badge
│   └── pages/       → Home, Catalog, Product, Cart,
│                       Checkout, OrderConfirm, Reviews, Contacts
└── server/                   ← Backend Express
    ├── index.js
    ├── db/
    │   ├── schema.js          ← Crea le tabelle SQLite
    │   └── seed.js            ← Popola il database
    └── routes/
        ├── products.js
        ├── categories.js
        ├── reviews.js
        ├── shopReviews.js
        ├── orders.js
        └── contacts.js
```

---

## Avvio rapido

### 1. Backend (porta 3001)

```bash
cd server
npm install
node db/seed.js      # Popola il database (eseguire una sola volta)
npm start
```

### 2. Frontend (porta 3000)

Apri un secondo terminale nella cartella principale del progetto:

```bash
npm install
npm start
```

Apri il browser su **http://localhost:3000**

> Il seed puo essere rieseguito in qualsiasi momento per azzerare e ripopolare il database.

---

## API REST

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/categories` | Lista categorie |
| GET | `/api/products` | Lista prodotti (filtri: `?category=`, `?search=`, `?featured=1`) |
| GET | `/api/products/:id` | Dettaglio prodotto |
| GET | `/api/products/:id/reviews` | Recensioni prodotto |
| POST | `/api/products/:id/reviews` | Crea recensione prodotto |
| GET | `/api/shop-reviews` | Recensioni negozio |
| POST | `/api/shop-reviews` | Crea recensione negozio |
| POST | `/api/orders` | Crea ordine |
| POST | `/api/contact` | Invia messaggio di contatto |

---

## Funzionalita principali

- **Catalogo** con filtro per categoria e ricerca testuale
- **Pagina prodotto** con selettore quantita (step 0.5 kg), totale live, recensioni
- **Carrello persistente** in localStorage con toast di conferma
- **Checkout in 3 step** con validazione campi in italiano
- **Conferma ordine** con codice univoco ORD-XXXXXX
- **Recensioni negozio** con distribuzione valutazioni e form
- **Pagina contatti** con modulo e orari

---

## Note tecniche

- **CORS** abilitato per `http://localhost:3000`
- **better-sqlite3** e sincrono — nessun async/await necessario sul server
- Le immagini provengono da Unsplash (URL esterni) con fallback in caso di errore
- Il carrello viene salvato nel `localStorage` del browser
- `tailwind.config.js` estende la palette con i colori bordeaux e gold del brand

---

*Progetto informatica — Sito dimostrativo*
