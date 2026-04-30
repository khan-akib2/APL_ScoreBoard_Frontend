'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // sessionStorage is tab-specific — cleared when the tab closes.
    // Each umpire/admin must log in on their own tab independently.
    const token  = sessionStorage.getItem('token');
    const stored = sessionStorage.getItem('user');

    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        sessionStorage.clear();
      }
    }

    setLoading(false);
  }, []);

  const login = (userData, token) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
