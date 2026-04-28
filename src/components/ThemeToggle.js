'use client';
import { useTheme } from '@/context/ThemeContext';

const OPTIONS = [
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    ),
  },
  {
    value: 'auto',
    label: 'Auto',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a10 10 0 0 1 0 20V2z" fill="currentColor" stroke="none" opacity="0.3"/>
        <circle cx="12" cy="12" r="10"/>
      </svg>
    ),
  },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{
      display: 'flex',
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 10,
      padding: 3,
      gap: 2,
    }}>
      {OPTIONS.map((o) => {
        const active = theme === o.value;
        return (
          <button
            key={o.value}
            onClick={() => setTheme(o.value)}
            title={o.label}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 10px', borderRadius: 7, border: 'none',
              cursor: 'pointer', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.04em',
              background: active ? 'var(--gold)' : 'transparent',
              color: active ? 'var(--bg-primary)' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
