import { useState } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useCart } from '../../hooks/useCart.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { logoutUser } from '../../api/api.js';
import { useTheme } from '../../context/ThemeContext.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/catalogo', label: 'Catalogo' },
  { to: '/recensioni', label: 'Recensioni' },
  { to: '/contatti', label: 'Contatti' },
];

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  );
}


  const { itemCount } = useCart();
  const { user, logout, setShowLoginModal } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  // Iniziale del nome utente per l'avatar
  const userInitial = user?.name?.charAt(0).toUpperCase() || '';

  return (
    <>
      <header className="h-16 bg-bordeaux sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center gap-4">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" className="flex flex-col leading-tight">
              <span className="font-serif text-white text-lg font-normal tracking-wide whitespace-nowrap">
                Il Macellaio di San Michele
              </span>
              <span className="text-white/60 text-xs tracking-widest uppercase">Ischia</span>
            </Link>
            <a
              href="https://www.instagram.com/il_macellaio_di_sanmichele?igsh=Nmtzam9hc3J4YW9m"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors mt-0.5"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
          </div>

          {/* Barra di ricerca */}
          <form onSubmit={handleSearch} className="flex-1 max-w-sm mx-auto hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca un prodotto..."
                className="w-full bg-white/10 text-white placeholder-white/50 rounded-full px-4 py-1.5 text-sm outline-none border border-white/20 focus:border-white/50 focus:bg-white/15 transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </div>
          </form>

          {/* Navigazione desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive ? 'bg-white/20 text-white font-medium' : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Toggle tema */}
          <button
            onClick={toggle}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-1.5"
            aria-label={dark ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Carrello */}
          <Link to="/carrello" className="relative flex-shrink-0 text-white/80 hover:text-white transition-colors p-1.5">
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Utente loggato / pulsante login */}
          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {userInitial}
                </div>
                <span className="text-sm max-w-24 truncate">{user.name.split(' ')[0]}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-[#1E1E1E] rounded-lg shadow-xl border border-edge dark:border-[#333333] py-1 min-w-44 z-50">
                  <div className="px-3 py-2 border-b border-edge dark:border-[#333333]">
                    <p className="text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE8] truncate">{user.name}</p>
                    <p className="text-xs text-[#888888] dark:text-[#777777] truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/ordini"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-[#1A1A1A] dark:text-[#F0EDE8] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    I miei ordini
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Esci
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="hidden md:flex items-center gap-1.5 text-sm text-white/80 hover:text-white border border-white/30 hover:border-white/60 px-3 py-1.5 rounded-md transition-colors flex-shrink-0"
            >
              Accedi
            </button>
          )}

          {/* Hamburger mobile */}
          <button
            className="md:hidden text-white/80 hover:text-white transition-colors p-1.5"
            onClick={() => setMenuOpen(true)}
            aria-label="Apri menu"
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      {/* Sidebar mobile */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="relative w-72 bg-bordeaux-dark h-full flex flex-col p-6 shadow-2xl">
            <button className="self-end text-white/70 hover:text-white mb-6" onClick={() => setMenuOpen(false)}>
              <CloseIcon />
            </button>
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <p className="font-serif text-white text-lg">Il Macellaio di San Michele</p>
                <a
                  href="https://www.instagram.com/il_macellaio_di_sanmichele?igsh=Nmtzam9hc3J4YW9m"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
              </div>
              <p className="text-white/50 text-xs uppercase tracking-widest">Ischia</p>
            </div>
            <form onSubmit={handleSearch} className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca un prodotto..."
                className="w-full bg-white/10 text-white placeholder-white/50 rounded-full px-4 py-2 text-sm outline-none border border-white/20 focus:border-white/50 transition-all"
              />
            </form>
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-sm transition-colors ${isActive ? 'bg-white/20 text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <Link to="/carrello" onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                Carrello
                {itemCount > 0 && (
                  <span className="bg-gold text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{itemCount}</span>
                )}
              </Link>
            </nav>
            <div className="mt-auto">
              {/* Toggle tema mobile */}
              <button
                onClick={toggle}
                className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
              >
                {dark ? <SunIcon /> : <MoonIcon />}
                {dark ? 'Tema chiaro' : 'Tema scuro'}
              </button>
              {user ? (
                <div className="border-t border-white/20 pt-4">
                  <p className="text-white/70 text-sm mb-2">{user.name}</p>
                  <Link
                    to="/ordini"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-3 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    I miei ordini
                  </Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-red-400 text-sm hover:text-red-300">
                    Esci
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setShowLoginModal(true); setMenuOpen(false); }}
                  className="w-full py-2.5 border border-white/30 text-white rounded-lg text-sm hover:bg-white/10 transition-colors"
                >
                  Accedi / Registrati
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chiude il dropdown utente cliccando fuori */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </>
  );
}
