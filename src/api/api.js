const BASE = '/api';

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Errore del server');
  }
  return data;
}

function authHeaders() {
  const token = localStorage.getItem('macelleria_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Prodotti
export const getProducts = (params = {}) => {
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.search) query.set('search', params.search);
  if (params.featured) query.set('featured', '1');
  const qs = query.toString();
  return fetchJson(`${BASE}/products${qs ? '?' + qs : ''}`);
};

export const getProduct = (id) => fetchJson(`${BASE}/products/${id}`);

// Categorie
export const getCategories = () => fetchJson(`${BASE}/categories`);

// Recensioni prodotto
export const getProductReviews = (productId) =>
  fetchJson(`${BASE}/products/${productId}/reviews`);

export const postProductReview = (productId, body) =>
  fetchJson(`${BASE}/products/${productId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

// Recensioni negozio
export const getShopReviews = () => fetchJson(`${BASE}/shop-reviews`);

export const postShopReview = (body) =>
  fetchJson(`${BASE}/shop-reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

// Ordini
export const createOrder = (body) =>
  fetchJson(`${BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });

// Contatti
export const sendContact = (body) =>
  fetchJson(`${BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

// Autenticazione
export const loginUser = (email, password) =>
  fetchJson(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

export const registerUser = (name, email, password) =>
  fetchJson(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

export const logoutUser = () =>
  fetchJson(`${BASE}/auth/logout`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
