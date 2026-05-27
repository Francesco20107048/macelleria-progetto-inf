import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { createOrder } from '../api/api.js';

const STEP_LABELS = ['Dati personali', 'Indirizzo di consegna', 'Pagamento'];

const PAYMENT_METHODS = [
  {
    id: 'carta',
    label: 'Carta di credito',
    desc: 'Visa, Mastercard, American Express',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    id: 'paypal',
    label: 'PayPal',
    desc: 'Paga con il tuo conto PayPal',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M7 11l2-7h6a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H9l-1 5H5"/>
      </svg>
    ),
  },
  {
    id: 'contrassegno',
    label: 'Contrassegno',
    desc: 'Pagamento in contanti alla consegna',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
  },
];

function ProgressBar({ step }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, index) => {
          const n = index + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={n} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-sm transition-colors ${
                    done
                      ? 'bg-green-600 text-white'
                      : active
                      ? 'bg-bordeaux text-white'
                      : 'bg-gray-200 dark:bg-[#2A2A2A] text-[#888888] dark:text-[#666666]'
                  }`}
                >
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : n}
                </div>
                <span
                  className={`text-xs mt-1.5 whitespace-nowrap hidden sm:block ${
                    active ? 'text-bordeaux font-medium' : 'text-[#888888] dark:text-[#666666]'
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-colors ${done ? 'bg-green-600' : 'bg-gray-200 dark:bg-[#333333]'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-red-600 text-xs mt-1">{msg}</p>;
}

function Input({ label, id, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">
        {label}
      </label>
      <input
        id={id}
        className={`w-full border rounded-md px-3 py-2.5 text-sm focus:outline-none transition-colors bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-gray-400 dark:placeholder-gray-600 ${
          error ? 'border-red-400 focus:border-red-500' : 'border-edge dark:border-[#444444] focus:border-bordeaux'
        }`}
        {...props}
      />
      <FieldError msg={error} />
    </div>
  );
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, loading: authLoading, setShowLoginModal } = useContext(AuthContext);
  const navigate = useNavigate();

  // Attende che la verifica del token sia completa prima di reindirizzare
  useEffect(() => {
    if (authLoading) return;
    if (!user && items.length > 0) {
      setShowLoginModal(true);
      navigate('/carrello');
    }
  }, [authLoading, user, items.length, setShowLoginModal, navigate]);

  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [apiError, setApiError] = useState('');

  // Controlla solo al mount: se il carrello è già vuoto all'ingresso, torna al carrello.
  // Non usa items.length come dipendenza: non deve scattare quando clearCart() lo svuota dopo l'ordine.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (items.length === 0) navigate('/carrello');
  }, []);

  const [form, setForm] = useState({
    name: '', surname: '', email: '', phone: '',
    address: '', city: '', zip: '', notes: '',
    payment: 'carta',
    cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '',
  });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  // Formatta il numero carta con spazi ogni 4 cifre
  const handleCardNumber = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    setForm((f) => ({ ...f, cardNumber: formatted }));
  };

  // Formatta la scadenza MM/AA
  const handleCardExpiry = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    const formatted = val.length > 2 ? val.slice(0, 2) + '/' + val.slice(2) : val;
    setForm((f) => ({ ...f, cardExpiry: formatted }));
  };

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.name.trim()) e.name = 'Il nome è obbligatorio';
      if (!form.surname.trim()) e.surname = 'Il cognome è obbligatorio';
      if (!form.email.trim()) e.email = "L'email è obbligatoria";
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Formato email non valido';
      if (!form.phone.trim()) e.phone = 'Il telefono è obbligatorio';
    }
    if (s === 2) {
      if (!form.address.trim()) e.address = "L'indirizzo è obbligatorio";
      if (!form.city.trim()) e.city = 'La città è obbligatoria';
      if (!form.zip.trim()) e.zip = 'Il CAP è obbligatorio';
      else if (!/^\d{5}$/.test(form.zip)) e.zip = 'Il CAP deve essere di 5 cifre';
    }
    if (s === 3 && form.payment === 'carta') {
      if (!form.cardNumber || form.cardNumber.replace(/\s/g, '').length < 16)
        e.cardNumber = 'Inserisci un numero carta valido (16 cifre)';
      if (!form.cardName.trim()) e.cardName = "Il nome sull'intestatario è obbligatorio";
      if (!form.cardExpiry || !/^\d{2}\/\d{2}$/.test(form.cardExpiry))
        e.cardExpiry = 'Formato non valido (MM/AA)';
      if (!form.cardCvv || form.cardCvv.length < 3)
        e.cardCvv = 'CVV non valido';
    }
    return e;
  };

  const handleNext = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => s - 1);
    setErrors({});
  };

  const SPEDIZIONE = totalPrice >= 50 ? 0 : 5;
  const totale = parseFloat((totalPrice + SPEDIZIONE).toFixed(2));

  const handleConfirm = async () => {
    const e = validate(3);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSending(true);
    setApiError('');
    try {
      const order = await createOrder({
        customer_name: form.name,
        customer_surname: form.surname,
        email: form.email,
        address: form.address,
        city: form.city,
        zip: form.zip,
        payment_method: form.payment,
        total: totale,
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity_kg: i.quantityKg,
          price_per_kg: i.product.price_per_kg,
        })),
      });
      clearCart();
      navigate('/ordine-confermato', {
        state: { order, items, totale, paymentMethod: form.payment },
      });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSending(false);
    }
  };

  // Mostra un loader mentre verifica l'autenticazione
  if (authLoading) {
    return <div className="flex items-center justify-center py-24 text-[#888888] dark:text-[#777777] text-sm">Caricamento...</div>;
  }



  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-serif text-3xl text-bordeaux font-normal mb-2">Checkout</h1>
      <div className="w-16 h-0.5 bg-gold mb-8" />

      <ProgressBar step={step} />

      {/* Step 1 – Dati personali */}
      {step === 1 && (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-edge dark:border-[#333333] p-6 animate-fadeIn">
          <h2 className="font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-5">Dati personali</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome *" id="name" value={form.name} onChange={set('name')} error={errors.name} placeholder="Mario" />
            <Input label="Cognome *" id="surname" value={form.surname} onChange={set('surname')} error={errors.surname} placeholder="Rossi" />
            <Input label="Email *" id="email" type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="mario@email.it" />
            <Input label="Telefono *" id="phone" type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="+39 333 123 4567" />
          </div>
        </div>
      )}

      {/* Step 2 – Indirizzo */}
      {step === 2 && (
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-edge dark:border-[#333333] p-6">
          <h2 className="font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-5">Indirizzo di consegna</h2>
          <div className="grid grid-cols-1 gap-4">
            <Input label="Via e numero civico *" id="address" value={form.address} onChange={set('address')} error={errors.address} placeholder="Via Roma 1" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Citta *" id="city" value={form.city} onChange={set('city')} error={errors.city} placeholder="Ischia" />
              <Input label="CAP *" id="zip" value={form.zip} onChange={set('zip')} error={errors.zip} placeholder="80077" />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">
                Note per il corriere (opzionale)
              </label>
              <textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={set('notes')}
                className="w-full border border-edge dark:border-[#444444] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-bordeaux transition-colors resize-none bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-gray-400 dark:placeholder-gray-600"
                placeholder="Citofono, piano, orari preferiti di consegna..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3 – Pagamento */}
      {step === 3 && (
        <div className="space-y-5">
          {/* Metodi di pagamento */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-edge dark:border-[#333333] p-6">
            <h2 className="font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-4">Metodo di pagamento</h2>
            <div className="grid grid-cols-1 gap-3">
              {PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    form.payment === pm.id
                      ? 'border-bordeaux bg-bordeaux/5 dark:bg-bordeaux/10'
                      : 'border-edge dark:border-[#444444] hover:border-bordeaux/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={pm.id}
                    checked={form.payment === pm.id}
                    onChange={set('payment')}
                    className="accent-bordeaux"
                  />
                  <span className="text-bordeaux">{pm.icon}</span>
                  <div>
                    <p className="font-medium text-sm text-[#1A1A1A] dark:text-[#F0EDE8]">{pm.label}</p>
                    <p className="text-xs text-[#888888] dark:text-[#777777]">{pm.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Campi carta di credito (finti) */}
            {form.payment === 'carta' && (
              <div className="mt-5 pt-5 border-t border-edge dark:border-[#333333] space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium text-[#555555] dark:text-[#A0A0A0] uppercase tracking-wide">Dati carta</p>
                  <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded font-medium">Demo</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">Numero carta *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.cardNumber}
                    onChange={handleCardNumber}
                    maxLength={19}
                    placeholder="1234 5678 9012 3456"
                    className={`w-full border rounded-md px-3 py-2.5 text-sm focus:outline-none tracking-widest font-mono transition-colors bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-gray-400 dark:placeholder-gray-600 ${errors.cardNumber ? 'border-red-400' : 'border-edge dark:border-[#444444] focus:border-bordeaux'}`}
                  />
                  {errors.cardNumber && <p className="text-red-600 text-xs mt-1">{errors.cardNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">Nome intestatario *</label>
                  <input
                    type="text"
                    value={form.cardName}
                    onChange={set('cardName')}
                    placeholder="MARIO ROSSI"
                    className={`w-full border rounded-md px-3 py-2.5 text-sm focus:outline-none uppercase transition-colors bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-gray-400 dark:placeholder-gray-600 ${errors.cardName ? 'border-red-400' : 'border-edge dark:border-[#444444] focus:border-bordeaux'}`}
                  />
                  {errors.cardName && <p className="text-red-600 text-xs mt-1">{errors.cardName}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">Scadenza *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.cardExpiry}
                      onChange={handleCardExpiry}
                      maxLength={5}
                      placeholder="MM/AA"
                      className={`w-full border rounded-md px-3 py-2.5 text-sm focus:outline-none font-mono tracking-widest transition-colors bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-gray-400 dark:placeholder-gray-600 ${errors.cardExpiry ? 'border-red-400' : 'border-edge dark:border-[#444444] focus:border-bordeaux'}`}
                    />
                    {errors.cardExpiry && <p className="text-red-600 text-xs mt-1">{errors.cardExpiry}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">CVV *</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={form.cardCvv}
                      onChange={(e) => setForm((f) => ({ ...f, cardCvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                      maxLength={3}
                      placeholder="***"
                      className={`w-full border rounded-md px-3 py-2.5 text-sm focus:outline-none font-mono tracking-widest transition-colors bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-gray-400 dark:placeholder-gray-600 ${errors.cardCvv ? 'border-red-400' : 'border-edge dark:border-[#444444] focus:border-bordeaux'}`}
                    />
                    {errors.cardCvv && <p className="text-red-600 text-xs mt-1">{errors.cardCvv}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Riepilogo compatto */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-edge dark:border-[#333333] p-5">
            <h3 className="font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-3 text-sm">Riepilogo ordine</h3>
            <div className="space-y-1.5 text-sm mb-3">
              {items.map(({ product, quantityKg }) => (
                <div key={product.id} className="flex justify-between text-[#555555] dark:text-[#A0A0A0]">
                  <span className="truncate mr-2">{product.name} x {quantityKg.toFixed(1)} kg</span>
                  <span className="flex-shrink-0">
                    {(product.price_per_kg * quantityKg).toLocaleString('it-IT', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-[#555555] dark:text-[#A0A0A0] pt-1">
                <span>Spedizione</span>
                <span>{SPEDIZIONE === 0 ? 'Gratuita' : `${SPEDIZIONE.toFixed(2)} €`}</span>
              </div>
              <div className="flex justify-between font-bold text-[#1A1A1A] dark:text-[#F0EDE8] pt-2 border-t border-edge dark:border-[#333333]">
                <span>Totale</span>
                <span className="text-bordeaux">
                  {totale.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-[#888888] dark:text-[#777777]">
              <span>Consegna a:</span>
              <span>{form.address}, {form.city} {form.zip}</span>
            </div>
          </div>

          {/* Nota dimostrativa */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
            <p className="text-amber-700 text-xs">
              Sito dimostrativo — Nessun pagamento reale verra effettuato
            </p>
          </div>

          {apiError && (
            <p className="text-red-600 text-sm text-center">{apiError}</p>
          )}
        </div>
      )}

      {/* Navigazione tra step */}
      <div className="flex justify-between mt-6">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="px-5 py-2.5 border border-edge dark:border-[#444444] rounded-md text-sm text-[#555555] dark:text-[#A0A0A0] hover:border-bordeaux hover:text-bordeaux transition-colors"
          >
            Indietro
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            onClick={handleNext}
            className="px-7 py-2.5 bg-bordeaux text-white rounded-md text-sm font-medium hover:bg-bordeaux-dark active:scale-95 transition-all"
          >
            Avanti
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={sending}
            className="px-7 py-2.5 bg-bordeaux text-white rounded-md text-sm font-medium hover:bg-bordeaux-dark disabled:opacity-50 active:scale-95 transition-all"
          >
            {sending ? 'Invio in corso...' : 'Conferma ordine'}
          </button>
        )}
      </div>
    </div>
  );
}
