'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

const navItems = [
  { href: '/dashboard', label: 'Home', isHome: true, icon: 'home' },
  { href: '/dashboard?tab=live', label: 'Live Matches', tab: 'live', icon: 'zap' },
  { href: '/dashboard?tab=upcoming', label: 'Upcoming', tab: 'upcoming', icon: 'calendar' },
  { href: '/dashboard?tab=results', label: 'Results', tab: 'results', icon: 'check' },
  { href: '/dashboard?tab=standings', label: 'Standings', tab: 'standings', icon: 'bar' },
];

const icons = {
  home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  zap: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  check: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  bar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
};

export default function UserSidebar({ onClose }) {
  return (
    <Suspense fallback={<aside className="sidebar" />}>
      <SidebarInner onClose={onClose} />
    </Suspense>
  );
}

function SidebarInner({ onClose }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams ? searchParams.get('tab') : null;

  const isActive = (item) => {
    if (pathname !== '/dashboard') return false;
    if (item.isHome) return !tab || tab === 'home';
    return tab === item.tab;
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo-area">
        <Image src="/logo.png" alt="Logo" width={50} height={50} unoptimized priority style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
        <div>
          <p className="sidebar-brand-name">APL SCOREBOARD</p>
          <p className="sidebar-brand-sub">Live Tournament</p>
        </div>
      </div>

      <p className="sidebar-section-label">Navigation</p>

      {/* Nav links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            onClick={onClose}
            className={`sidebar-link ${isActive(item) ? 'active' : ''}`}>
            {icons[item.icon]}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 2 }}>Theme</p>
          <ThemeToggle />
        </div>
        <div className="sidebar-user-card" style={{ justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>APL Tournament</p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>Public Access</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
