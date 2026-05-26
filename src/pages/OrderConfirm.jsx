import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

const METODO_LABELS = {
  carta: 'Carta di credito',
  paypal: 'PayPal',
  contrassegno: 'Contrassegno',
};

// Sequenza di delay per ogni elemento
const DELAYS = {
  circle:   80,
  ripple:   380,
  draw:     460,
  title:    680,
  subtitle: 820,
  badge:    960,
  products: 1080,
  details:  1220,
  cta:      1360,
};

export default function OrderConfirm() {
  const location = useLocation();
  const { order, items, totale, paymentMethod } = location.state || {};

  // Un booleano per elemento — tutti partono a false
  const [vis, setVis] = useState({
    circle: false, ripple: false, draw: false,
    title: false, subtitle: false, badge: false,
    products: false, details: false, cta: false,
  });

  useEffect(() => {
    if (!order) return;

    // RAF garantisce che il browser dipinga lo stato iniziale (tutto invisible)
    // prima che i timeout cambino i valori. La cleanup cancella sia il RAF sia
    // i timer già schedulati, rendendo l'effetto sicuro in React StrictMode.
    let timers = [];
    const raf = requestAnimationFrame(() => {
      timers = Object.entries(DELAYS).map(([key, delay]) =>
        setTimeout(() => setVis((v) => ({ ...v, [key]: true })), delay)
      );
    });

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [order]);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-[#888888] dark:text-[#777777] mb-4">Nessun ordine trovato.</p>
        <Link to="/" className="text-bordeaux underline text-sm">
          Torna alla home
        </Link>
      </div>
    );
  }

  // Stile base per ogni elemento animato
  const fadeStyle = (key, extra = {}) => ({
    opacity: vis[key] ? 1 : 0,
    transform: vis[key] ? 'translateY(0px)' : 'translateY(20px)',
    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
    ...extra,
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">

      {/* ── Cerchio + spunta + onde ── */}
      <div className="text-center mb-10">
        <div className="relative inline-flex items-center justify-center mb-6">

          {/* Onda 1 */}
          {vis.ripple && (
            <div className="absolute w-24 h-24 rounded-full border-2 border-gold/60 ripple-ring" />
          )}
          {/* Onda 2 */}
          {vis.ripple && (
            <div className="absolute w-24 h-24 rounded-full border-2 border-gold/35 ripple-ring-delay" />
          )}

          {/* Cerchio principale — scala da 0.2 a 1 */}
          <div
            className="relative w-24 h-24 rounded-full bg-gold/15 border-2 border-gold/40 flex items-center justify-center"
            style={{
              opacity: vis.circle ? 1 : 0,
              transform: vis.circle ? 'scale(1)' : 'scale(0.2)',
              transition: 'opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Spunta SVG — stroke-dashoffset: tratto si disegna */}
            <svg
              width="48" height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C9A84C"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline
                points="20 6 9 17 4 12"
                style={{
                  strokeDasharray: '30',
                  strokeDashoffset: vis.draw ? '0' : '30',
                  transition: vis.draw
                    ? 'stroke-dashoffset 0.6s ease-out'
                    : 'none',
                }}
              />
            </svg>
          </div>
        </div>

        {/* Titolo */}
        <div style={fadeStyle('title')}>
          <h1 className="font-serif text-4xl text-bordeaux font-normal mb-3">
            Ordine confermato!
          </h1>
        </div>

        {/* Sottotitolo */}
        <div style={fadeStyle('subtitle')}>
          <p className="text-[#555555] dark:text-[#A0A0A0] mb-4">
            Grazie per il tuo ordine. Riceverai presto una conferma all'indirizzo indicato.
          </p>
        </div>

        {/* Badge codice ordine */}
        <div
          style={{
            opacity: vis.badge ? 1 : 0,
            transform: vis.badge ? 'scale(1)' : 'scale(0.8)',
            transition: 'opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            display: 'inline-block',
          }}
          className="bg-bordeaux/5 dark:bg-bordeaux/10 border border-bordeaux/20 rounded-xl px-6 py-3"
        >
          <p className="text-xs text-[#888888] dark:text-[#777777] mb-0.5 uppercase tracking-widest">Codice ordine</p>
          <p className="font-bold text-bordeaux text-xl tracking-widest font-mono">
            {order.order_code}
          </p>
        </div>
      </div>

      {/* ── Prodotti ordinati ── */}
      <div style={fadeStyle('products')} className="mb-5">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-edge dark:border-[#333333] p-5">
          <h2 className="font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-4 text-sm uppercase tracking-wide">
            Prodotti ordinati
          </h2>
          <div className="space-y-3">
            {items && items.map(({ product, quantityKg }) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-[#2A2A2A] flex-shrink-0">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div
                    style={{ display: 'none' }}
                    className="w-full h-full bg-gray-100 dark:bg-[#2A2A2A] flex items-center justify-center text-gray-400 text-xs"
                  >
                    {product.name}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] truncate">{product.name}</p>
                  <p className="text-xs text-[#888888] dark:text-[#777777]">
                    {quantityKg.toFixed(1)} kg &times;{' '}
                    {product.price_per_kg.toLocaleString('it-IT', {
                      style: 'currency', currency: 'EUR',
                    })}
                  </p>
                </div>
                <p className="text-sm font-semibold text-bordeaux flex-shrink-0">
                  {(product.price_per_kg * quantityKg).toLocaleString('it-IT', {
                    style: 'currency', currency: 'EUR',
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Dettagli ordine ── */}
      <div style={fadeStyle('details')} className="mb-8">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-edge dark:border-[#333333] p-5">
          <h2 className="font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-4 text-sm uppercase tracking-wide">
            Dettagli ordine
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-[#888888] dark:text-[#777777] mb-0.5">Destinatario</p>
              <p className="text-[#1A1A1A] dark:text-[#F0EDE8]">{order.customer_name} {order.customer_surname}</p>
            </div>
            <div>
              <p className="text-xs text-[#888888] dark:text-[#777777] mb-0.5">Email</p>
              <p className="text-[#1A1A1A] dark:text-[#F0EDE8] truncate">{order.email}</p>
            </div>
            <div>
              <p className="text-xs text-[#888888] dark:text-[#777777] mb-0.5">Indirizzo di consegna</p>
              <p className="text-[#1A1A1A] dark:text-[#F0EDE8]">{order.address}, {order.city} {order.zip}</p>
            </div>
            <div>
              <p className="text-xs text-[#888888] dark:text-[#777777] mb-0.5">Metodo di pagamento</p>
              <p className="text-[#1A1A1A] dark:text-[#F0EDE8]">{METODO_LABELS[paymentMethod] || paymentMethod}</p>
            </div>
            <div className="col-span-2 pt-3 border-t border-edge dark:border-[#333333]">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#1A1A1A] dark:text-[#F0EDE8]">Totale pagato</span>
                <span className="font-bold text-bordeaux text-xl">
                  {totale && totale.toLocaleString('it-IT', {
                    style: 'currency', currency: 'EUR',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={fadeStyle('cta')} className="text-center">
        <Link
          to="/"
          className="inline-block px-10 py-3 bg-bordeaux text-white rounded-lg font-medium hover:bg-bordeaux-dark transition-colors shadow-sm"
        >
          Torna alla home
        </Link>
      </div>
    </div>
  );
}
