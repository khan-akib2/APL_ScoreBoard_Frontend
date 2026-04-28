'use client';
import { createContext, useContext, useEffect, useState } from 'react';

// theme: 'dark' | 'light' | 'auto'
const ThemeContext = createContext({ theme: 'dark', resolved: 'dark', setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark');
  const [resolved, setResolved] = useState('dark');

  // On mount, read saved preference
  useEffect(() => {
    const saved = localStorage.getItem('apl-theme') || 'dark';
    setThemeState(saved);
  }, []);

  // Whenever theme or system preference changes, resolve actual mode
  useEffect(() => {
    const apply = (t) => {
      const r = t === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
        : t;
      setResolved(r);
      document.documentElement.setAttribute('data-theme', r);
    };

    apply(theme);

    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: light)');
      const handler = () => apply('auto');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  const setTheme = (t) => {
    localStorage.setItem('apl-theme', t);
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
