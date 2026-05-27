import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { loginUser, registerUser } from '../../api/api.js';

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function PasswordInput({ id, label, value, onChange, error }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className={`w-full border rounded-md px-3 py-2.5 text-sm pr-9 focus:outline-none transition-colors bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-gray-400 dark:placeholder-gray-600 ${error ? 'border-red-400' : 'border-edge dark:border-[#444444] focus:border-bordeaux'}`}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-bordeaux transition-colors"
          tabIndex={-1}
        >
          <EyeIcon open={show} />
        </button>
      </div>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function LoginModal() {
  const { showLoginModal, setShowLoginModal, login } = useAuth();
  const [tab, setTab] = useState('accedi');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Chiude la modal con Esc
  useEffect(() => {
    if (!showLoginModal) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowLoginModal(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showLoginModal, setShowLoginModal]);

  // Reset form quando si cambia tab
  useEffect(() => {
    setForm({ name: '', email: '', password: '', confirm: '' });
    setErrors({});
  }, [tab, showLoginModal]);

  if (!showLoginModal) return null;

  const set = (f) => (e) => setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const validateLogin = () => {
    const e = {};
    if (!form.email.trim()) e.email = "L'email è obbligatoria";
    if (!form.password) e.password = 'La password è obbligatoria';
    return e;
  };

  const validateRegister = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Il nome è obbligatorio';
    if (!form.email.trim()) e.email = "L'email è obbligatoria";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email non valida';
    if (!form.password) e.password = 'La password è obbligatoria';
    else if (form.password.length < 6) e.password = 'Minimo 6 caratteri';
    if (form.password !== form.confirm) e.confirm = 'Le password non coincidono';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = tab === 'accedi' ? validateLogin() : validateRegister();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      let data;
      if (tab === 'accedi') {
        data = await loginUser(form.email, form.password);
      } else {
        data = await registerUser(form.name, form.email, form.password);
      }
      login(data.token, data.user);
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowLoginModal(false)}
      />

      {/* Card */}
      <div className="relative bg-white dark:bg-[#1E1E1E] rounded-xl shadow-2xl w-full max-w-sm p-6">
        {/* Chiudi */}
        <button
          onClick={() => setShowLoginModal(false)}
          className="absolute top-4 right-4 text-[#888888] hover:text-bordeaux transition-colors"
          aria-label="Chiudi"
        >
          <CloseIcon />
        </button>

        {/* Logo */}
        <div className="text-center mb-5">
          <p className="font-serif text-bordeaux text-lg">Il Macellaio di San Michele</p>
        </div>

        {/* Tab */}
        <div className="flex bg-gray-100 dark:bg-[#2A2A2A] rounded-lg p-1 mb-5">
          <button
            onClick={() => setTab('accedi')}
            className={`flex-1 py-2 text-sm rounded-md font-medium transition-all ${tab === 'accedi' ? 'bg-white dark:bg-[#1E1E1E] shadow text-bordeaux' : 'text-[#555555] dark:text-[#A0A0A0] hover:text-bordeaux'}`}
          >
            Accedi
          </button>
          <button
            onClick={() => setTab('registrati')}
            className={`flex-1 py-2 text-sm rounded-md font-medium transition-all ${tab === 'registrati' ? 'bg-white dark:bg-[#1E1E1E] shadow text-bordeaux' : 'text-[#555555] dark:text-[#A0A0A0] hover:text-bordeaux'}`}
          >
            Registrati
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === 'registrati' && (
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">Nome *</label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                className={`w-full border rounded-md px-3 py-2.5 text-sm focus:outline-none transition-colors bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-gray-400 dark:placeholder-gray-600 ${errors.name ? 'border-red-400' : 'border-edge dark:border-[#444444] focus:border-bordeaux'}`}
                placeholder="Mario Rossi"
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              className={`w-full border rounded-md px-3 py-2.5 text-sm focus:outline-none transition-colors bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-[#F0EDE8] placeholder-gray-400 dark:placeholder-gray-600 ${errors.email ? 'border-red-400' : 'border-edge dark:border-[#444444] focus:border-bordeaux'}`}
              placeholder="mario@email.it"
              autoComplete="email"
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>

          <PasswordInput
            id="password"
            label="Password *"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
          />

          {tab === 'registrati' && (
            <PasswordInput
              id="confirm"
              label="Conferma password *"
              value={form.confirm}
              onChange={set('confirm')}
              error={errors.confirm}
            />
          )}

          {errors.api && (
            <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <p className="text-red-700 text-sm">{errors.api}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-bordeaux text-white rounded-md font-medium text-sm hover:bg-bordeaux-dark disabled:opacity-50 transition-colors mt-1"
          >
            {loading ? 'Attendere...' : tab === 'accedi' ? 'Accedi' : 'Crea account'}
          </button>
        </form>
      </div>
    </div>
  );
}
