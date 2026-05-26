import { useState, useContext, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirm from './pages/OrderConfirm.jsx';
import Reviews from './pages/Reviews.jsx';
import Contacts from './pages/Contacts.jsx';
import Orders from './pages/Orders.jsx';
import LoginModal from './components/ui/LoginModal.jsx';
import { CartContext } from './context/CartContext.jsx';
import { AuthContext } from './context/AuthContext.jsx';

// Toast per il carrello
function Toast() {
  const { toast } = useContext(CartContext);
  if (!toast.visible) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-bordeaux text-white px-5 py-3 rounded-lg shadow-xl text-sm font-medium">
      {toast.message}
    </div>
  );
}

// Banner non invasivo per utenti non autenticati
function LoginBanner() {
  const { user, setShowLoginModal } = useContext(AuthContext);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('loginBannerDismissed') === 'true'
  );

  if (user || dismissed) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 flex justify-center px-4 pt-2 pointer-events-none">
      <div className="bg-white dark:bg-[#1E1E1E] border border-edge dark:border-[#333333] shadow-md rounded-lg px-4 py-2.5 flex items-center gap-3 pointer-events-auto max-w-lg w-full">
        <svg className="text-gold flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p className="text-sm text-[#555555] dark:text-[#A0A0A0] flex-1 leading-snug">
          Accedi o registrati per poter aggiungere prodotti al carrello
        </p>
        <button
          onClick={() => setShowLoginModal(true)}
          className="flex-shrink-0 text-sm font-medium text-bordeaux hover:underline"
        >
          Accedi
        </button>
        <button
          onClick={() => {
            setDismissed(true);
            sessionStorage.setItem('loginBannerDismissed', 'true');
          }}
          className="flex-shrink-0 text-[#888888] hover:text-bordeaux transition-colors p-0.5"
          aria-label="Chiudi avviso"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-cream dark:bg-[#111111] flex flex-col transition-colors duration-200">
      <Header />
      <LoginBanner />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/prodotto/:id" element={<Product />} />
          <Route path="/carrello" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/ordine-confermato" element={<OrderConfirm />} />
          <Route path="/ordini" element={<Orders />} />
          <Route path="/recensioni" element={<Reviews />} />
          <Route path="/contatti" element={<Contacts />} />
        </Routes>
      </main>
      <Footer />
      <Toast />
      <LoginModal />
    </div>
  );
}

export default App;
