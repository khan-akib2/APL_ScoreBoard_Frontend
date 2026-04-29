'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // sessionStorage is tab-specific — only the tab that called login() has 'tab_owns_session'
    const tabOwns   = sessionStorage.getItem('tab_owns_session');
    const stored    = localStorage.getItem('user');

    if (stored && tabOwns === '1') {
      // This tab logged in — restore session
      setUser(JSON.parse(stored));
    } else if (stored && !tabOwns) {
      // Another tab is logged in — this tab should NOT be authenticated
      // Clear cookies immediately so middleware redirects to login
      deleteCookie('token');
      deleteCookie('role');
      // Hard redirect right away — no blank screen
      if (typeof window !== 'undefined' &&
          window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin/login') {
        window.location.replace('/admin/login');
        return;
      }
    }

    setLoading(false);

    // Listen for localStorage changes from other tabs
    const handleStorage = (e) => {
      if (e.key === 'apl_logout') {
        // Another tab logged out — clear this tab
        sessionStorage.removeItem('tab_owns_session');
        deleteCookie('token');
        deleteCookie('role');
        setUser(null);
        if (window.location.pathname.startsWith('/admin') &&
            window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      }

      if (e.key === 'apl_login') {
        // Another tab just logged in — kick this tab if it was also logged in
        const tabOwnsNow = sessionStorage.getItem('tab_owns_session');
        if (tabOwnsNow === '1') {
          // This tab had a session — it's now invalidated
          sessionStorage.removeItem('tab_owns_session');
          deleteCookie('token');
          deleteCookie('role');
          setUser(null);
          window.location.href = '/admin/login';
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = (userData, token) => {
    // Mark THIS tab as the owner
    sessionStorage.setItem('tab_owns_session', '1');

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setCookie('token', token);
    setCookie('role', userData.role);
    setUser(userData);

    // Signal other tabs that a new login happened
    localStorage.setItem('apl_login', Date.now().toString());
    // Clean up the signal key (it just needs to trigger the event)
    setTimeout(() => localStorage.removeItem('apl_login'), 500);
  };

  const logout = () => {
    sessionStorage.removeItem('tab_owns_session');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    deleteCookie('token');
    deleteCookie('role');
    setUser(null);

    // Signal other tabs
    localStorage.setItem('apl_logout', Date.now().toString());
    setTimeout(() => localStorage.removeItem('apl_logout'), 500);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
