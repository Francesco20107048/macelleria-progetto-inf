import { createContext, useState, useEffect, useContext, useCallback } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Verifica il token salvato al caricamento dell'app
  useEffect(() => {
    const token = localStorage.getItem('macelleria_token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem('macelleria_token');
        }
      })
      .catch(() => localStorage.removeItem('macelleria_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((token, userData) => {
    localStorage.setItem('macelleria_token', token);
    setUser(userData);
    setShowLoginModal(false);
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem('macelleria_token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignora errori di rete durante logout
      }
    }
    localStorage.removeItem('macelleria_token');
    setUser(null);
  }, []);

  // Chiede il login prima di eseguire un'azione protetta
  const requireAuth = useCallback(
    (action) => {
      if (!user) {
        setShowLoginModal(true);
        return false;
      }
      if (action) action();
      return true;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, showLoginModal, setShowLoginModal, requireAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
