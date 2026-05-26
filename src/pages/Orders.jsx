import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const METODO_LABELS = {
  carta: 'Carta di credito',
  paypal: 'PayPal',
  contrassegno: 'Contrassegno',
};

function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const date = new Date(order.created_at).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-edge dark:border-[#333333] overflow-hidden">
      {/* Header riga ordine */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
      >
        {/* Codice */}
        <div className="flex-1 min-w-0">
          <p className="font-mono font-bold text-bordeaux text-sm tracking-wider">
            {order.order_code}
          </p>
          <p className="text-xs text-[#888888] dark:text-[#777777] mt-0.5">{date}</p>
        </div>

        {/* Totale */}
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-[#1A1A1A] dark:text-[#F0EDE8] text-sm">
            {order.total.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-xs text-[#888888] dark:text-[#777777]">
            {METODO_LABELS[order.payment_method] || order.payment_method}
          </p>
        </div>

        {/* Chevron */}
        <svg
          width="16" height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={`flex-shrink-0 text-[#888888] dark:text-[#666666] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dettaglio espanso */}
      {open && (
        <div className="border-t border-edge dark:border-[#333333] px-5 py-4 space-y-4">
          {/* Prodotti */}
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.product_id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-[#2A2A2A] flex-shrink-0">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] truncate">{item.name}</p>
                  <p className="text-xs text-[#888888] dark:text-[#777777]">
                    {item.quantity_kg.toFixed(1)} kg &times;{' '}
                    {item.price_per_kg.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
                <p className="text-sm font-semibold text-bordeaux flex-shrink-0">
                  {(item.price_per_kg * item.quantity_kg).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
            ))}
          </div>

          {/* Indirizzo di consegna */}
          <div className="border-t border-edge dark:border-[#333333] pt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-[#888888] dark:text-[#777777] mb-0.5">Consegnato a</p>
              <p className="text-[#1A1A1A] dark:text-[#F0EDE8]">
                {order.customer_name} {order.customer_surname}
              </p>
              <p className="text-[#555555] dark:text-[#A0A0A0] text-xs mt-0.5">
                {order.address}, {order.city} {order.zip}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#888888] dark:text-[#777777] mb-0.5">Totale pagato</p>
              <p className="font-bold text-bordeaux text-lg">
                {order.total.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetch(`/api/orders?email=${encodeURIComponent(user.email)}`)
      .then((r) => {
        if (!r.ok) throw new Error('Errore nel caricamento degli ordini');
        return r.json();
      })
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-serif text-3xl text-bordeaux font-normal mb-2">I miei ordini</h1>
      <div className="w-16 h-0.5 bg-gold mb-8" />

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-[#2A2A2A] rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-20">
          <svg
            className="mx-auto mb-5 text-gray-300 dark:text-[#444444]"
            width="56" height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <h2 className="font-serif text-xl text-[#1A1A1A] dark:text-[#F0EDE8] mb-2">
            Nessun ordine ancora
          </h2>
          <p className="text-[#888888] dark:text-[#777777] text-sm mb-6">
            Quando effettuerai un ordine lo troverai qui
          </p>
          <Link
            to="/catalogo"
            className="inline-block px-6 py-2.5 bg-bordeaux text-white rounded-md text-sm font-medium hover:bg-bordeaux-dark transition-colors"
          >
            Vai al catalogo
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-[#888888] dark:text-[#777777] mb-4">
            {orders.length} {orders.length === 1 ? 'ordine effettuato' : 'ordini effettuati'}
          </p>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
