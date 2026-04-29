'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // sessionStorage is tab-specific and cleared when the tab closes.
    // Each umpire/admin must log in on their own tab — no shared sessions.
    const token   = sessionStorage.getItem('token');
    const stored  = sessionStorage.getItem('user');

    if (token && stored) {
      try {
        const userData = JSON.parse(stored);
        // Re-set session cookies in case they expired (page refresh)
        document.cookie = `token=${token}; path=/; SameSite=Strict`;
        document.cookie = `role=${userData.role}; path=/; SameSite=Strict`;
        setUser(userData);
      } catch {
        sessionStorage.clear();
      }
    }

    setLoading(false);
  }, []);

  const login = (userData, token) => {
    // Store only in sessionStorage — tab-specific, cleared on tab close
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));

    // Set session cookies (no expiry = cleared when browser/tab closes)
    // These are needed for the Next.js middleware route protection
    document.cookie = `token=${token}; path=/; SameSite=Strict`;
    document.cookie = `role=${userData.role}; path=/; SameSite=Strict`;

    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    // Clear cookies
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    document.cookie = 'role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
