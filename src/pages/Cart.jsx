import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';

function EmptyCart() {
  return (
    <div className="text-center py-24">
      <svg
        className="mx-auto mb-5 text-gray-300"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      <h2 className="font-serif text-2xl text-[#1A1A1A] dark:text-[#F0EDE8] mb-2">Il carrello e vuoto</h2>
      <p className="text-[#888888] dark:text-[#777777] text-sm mb-6">
        Aggiungi qualche prodotto dal nostro catalogo per iniziare il tuo ordine
      </p>
      <Link
        to="/catalogo"
        className="inline-block px-6 py-2.5 bg-bordeaux text-white rounded-md text-sm font-medium hover:bg-bordeaux-dark transition-colors"
      >
        Vai al catalogo
      </Link>
    </div>
  );
}

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, itemCount } = useCart();
  const navigate = useNavigate();
  const [confirmRemove, setConfirmRemove] = useState(null);

  const SPEDIZIONE = totalPrice >= 50 ? 0 : 5;
  const totaleFinale = totalPrice + SPEDIZIONE;

  const handleRemove = (productId) => {
    if (confirmRemove === productId) {
      removeItem(productId);
      setConfirmRemove(null);
    } else {
      setConfirmRemove(productId);
    }
  };

  if (items.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-serif text-3xl text-bordeaux font-normal mb-2">Carrello</h1>
      <div className="w-16 h-0.5 bg-gold mb-10" />
      <EmptyCart />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-serif text-3xl text-bordeaux font-normal mb-2">Carrello</h1>
      <div className="w-16 h-0.5 bg-gold mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista prodotti */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ product, quantityKg }) => (
              <div
                key={product.id}
                className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-edge dark:border-[#333333] p-4 flex gap-4 items-start"
              >
                {/* Immagine */}
                <Link to={`/prodotto/${product.id}`} className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-[#2A2A2A]">
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
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/prodotto/${product.id}`}
                    className="font-medium text-[#1A1A1A] dark:text-[#F0EDE8] hover:text-bordeaux transition-colors text-sm"
                  >
                    {product.name}
                  </Link>
                  <p className="text-[#888888] dark:text-[#777777] text-xs mt-0.5">
                    {product.price_per_kg.toLocaleString('it-IT', {
                      style: 'currency',
                      currency: 'EUR',
                    })}{' '}
                    / kg
                  </p>

                  {/* Controllo quantita */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => updateQuantity(product.id, parseFloat((quantityKg - 0.5).toFixed(1)))}
                      disabled={quantityKg <= 0.5}
                      className="w-7 h-7 rounded border border-edge dark:border-[#444444] text-sm flex items-center justify-center hover:border-bordeaux hover:text-bordeaux disabled:opacity-40 transition-colors dark:text-[#F0EDE8]"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-14 text-center dark:text-[#F0EDE8]">
                      {quantityKg.toFixed(1)} kg
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, parseFloat((quantityKg + 0.5).toFixed(1)))}
                      className="w-7 h-7 rounded border border-edge dark:border-[#444444] text-sm flex items-center justify-center hover:border-bordeaux hover:text-bordeaux transition-colors dark:text-[#F0EDE8]"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Subtotale + rimozione */}
                <div className="flex-shrink-0 text-right flex flex-col items-end gap-2">
                  <p className="font-bold text-bordeaux text-sm">
                    {(product.price_per_kg * quantityKg).toLocaleString('it-IT', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </p>

                  {confirmRemove === product.id ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="text-xs text-red-600 border border-red-200 rounded px-2 py-0.5 hover:bg-red-50 transition-colors"
                      >
                        Conferma
                      </button>
                      <button
                        onClick={() => setConfirmRemove(null)}
                        className="text-xs text-[#888888] border border-edge rounded px-2 py-0.5 hover:bg-gray-50 transition-colors"
                      >
                        Annulla
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRemove(product.id)}
                      className="text-xs text-[#888888] hover:text-red-600 transition-colors"
                    >
                      Rimuovi
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Riepilogo ordine */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-edge dark:border-[#333333] p-5 sticky top-24">
            <h2 className="font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-4">Riepilogo ordine</h2>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-[#555555] dark:text-[#A0A0A0]">
                <span>Subtotale ({itemCount} {itemCount === 1 ? 'articolo' : 'articoli'})</span>
                <span>
                  {totalPrice.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="flex justify-between text-[#555555] dark:text-[#A0A0A0]">
                <span>Spedizione</span>
                <span>
                  {SPEDIZIONE === 0 ? (
                    <span className="text-green-600 font-medium">Gratuita</span>
                  ) : (
                    SPEDIZIONE.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
                  )}
                </span>
              </div>
              {totalPrice < 50 && (
                <p className="text-xs text-[#888888] dark:text-[#777777] bg-gray-50 dark:bg-[#2A2A2A] rounded p-2">
                  Aggiungi{' '}
                  {(50 - totalPrice).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}{' '}
                  per la spedizione gratuita
                </p>
              )}
            </div>

            <div className="border-t border-edge dark:border-[#333333] pt-3 mb-5">
              <div className="flex justify-between font-bold text-[#1A1A1A] dark:text-[#F0EDE8]">
                <span>Totale</span>
                <span className="text-bordeaux text-lg">
                  {totaleFinale.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3 bg-bordeaux text-white rounded-md font-medium hover:bg-bordeaux-dark active:scale-95 transition-all text-sm"
            >
              Procedi al checkout
            </button>

            <Link
              to="/catalogo"
              className="block text-center text-sm text-[#888888] hover:text-bordeaux mt-3 transition-colors"
            >
              Continua gli acquisti
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
