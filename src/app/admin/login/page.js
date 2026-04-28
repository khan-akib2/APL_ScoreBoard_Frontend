'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

export default function AdminLoginPage() {
  const [form, setForm]                 = useState({ email: '', password: '' });
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await api.post('/auth/login', form);
    if (res.token) {
      if (res.user.role !== 'admin') {
        setError('Access denied. Admin accounts only.');
        setLoading(false);
        return;
      }
      login(res.user, res.token);
      router.push('/admin');
    } else {
      setError(res.message || 'Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#060e1a', fontFamily: 'var(--font-inter)', overflow: 'hidden' }}>

      {/* ── Left — decorative panel ─────────────────────────────────────── */}
      <div className="login-left" style={{
        width: '48%', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #0a1628 0%, #060e1a 100%)',
        borderRight: '1px solid rgba(201,162,39,0.08)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 56px',
      }}>

        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(201,162,39,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: -120, left: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,162,39,0.1), transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,162,39,0.06), transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
            <Image src="/logo.png" alt="APL" width={44} height={44} unoptimized style={{ objectFit: 'contain' }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: '#c9a227', letterSpacing: '0.08em', lineHeight: 1.2 }}>APL SCOREBOARD</p>
              <p style={{ fontSize: 10, color: '#4a6a82', letterSpacing: '0.1em', fontWeight: 600 }}>SEASON 8 · 2026</p>
            </div>
          </div>

          {/* Headline */}
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a227', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>Admin Control Panel</p>
            <h1 style={{ fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 900, color: '#e8e8e8', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 16 }}>
              Manage the<br />
              <span style={{ background: 'linear-gradient(135deg, #f3c570, #c9a227)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Entire Tournament
              </span>
            </h1>
            <p style={{ fontSize: 14, color: '#8b9db7', lineHeight: 1.7, maxWidth: 340 }}>
              Live scoring, team management, fixtures, standings — all from one secure dashboard.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Live ball-by-ball scoring with undo',   icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
              { label: 'Team & player roster management',       icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              { label: 'Schedule generation & fixture control', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
              { label: 'Standings & NRR auto-calculation',      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
              { label: 'Semi-final & final bracket management', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg> },
            ].map((f) => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a227',
                }}>{f.icon}</div>
                <span style={{ fontSize: 13, color: '#8b9db7', fontWeight: 500 }}>{f.label}</span>
              </div>
            ))}
          </div>

          {/* Bottom badge */}
          <div style={{
            marginTop: 56, display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 8,
            background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.12)',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontSize: 11, color: '#4a6a82', fontWeight: 600, letterSpacing: '0.06em' }}>JWT-secured · Restricted access only</span>
          </div>
        </div>
      </div>

      {/* ── Right — form ────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative',
      }}>

        {/* Subtle glow */}
        <div style={{ position: 'absolute', top: '30%', right: '20%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,162,39,0.04), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>

          {/* Mobile logo */}
          <div className="login-mobile-logo" style={{ textAlign: 'center', marginBottom: 36, display: 'none' }}>
            <Image src="/logo.png" alt="APL" width={52} height={52} unoptimized style={{ objectFit: 'contain', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: 13, fontWeight: 800, color: '#c9a227', letterSpacing: '0.08em' }}>APL SCOREBOARD</p>
            <p style={{ fontSize: 10, color: '#4a6a82', marginTop: 2, letterSpacing: '0.08em' }}>SEASON 8 · 2026</p>
          </div>

          {/* Form header */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#e8e8e8', letterSpacing: '-0.02em', marginBottom: 6 }}>Sign in</h2>
            <p style={{ fontSize: 14, color: '#4a6a82' }}>Enter your admin credentials to continue</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '12px 14px', borderRadius: 10, marginBottom: 20,
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', fontSize: 13, lineHeight: 1.5,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b9db7', marginBottom: 8, letterSpacing: '0.04em' }}>
                EMAIL ADDRESS
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4a6a82', pointerEvents: 'none' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input
                  type="email" required autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@example.com"
                  style={{
                    width: '100%', padding: '13px 14px 13px 42px',
                    background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10, color: '#e8e8e8', fontSize: 14,
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color .2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b9db7', marginBottom: 8, letterSpacing: '0.04em' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4a6a82', pointerEvents: 'none' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••••"
                  style={{
                    width: '100%', padding: '13px 44px 13px 42px',
                    background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10, color: '#e8e8e8', fontSize: 14,
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color .2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#4a6a82',
                  padding: 0, display: 'flex', transition: 'color .2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#c9a227'}
                  onMouseLeave={e => e.currentTarget.style.color = '#4a6a82'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    {showPassword
                      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                      : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              marginTop: 8,
              width: '100%', padding: '14px',
              borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'rgba(201,162,39,0.5)' : 'linear-gradient(135deg, #d4a82a, #c9a227)',
              color: '#060e1a', fontSize: 14, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading ? 'none' : '0 8px 24px rgba(201,162,39,0.2)',
              transition: 'opacity .2s, box-shadow .2s',
              letterSpacing: '0.02em',
            }}>
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(6,14,26,0.25)', borderTopColor: '#060e1a', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  Signing in...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Sign In to Admin Panel
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
            <span style={{ fontSize: 11, color: '#2a3f55', fontWeight: 600, letterSpacing: '0.08em' }}>SECURED BY JWT</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
          </div>

          {/* Security note */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px', borderRadius: 10,
            background: 'rgba(201,162,39,0.03)', border: '1px solid rgba(201,162,39,0.08)',
            marginBottom: 28,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <p style={{ fontSize: 12, color: '#4a6a82', lineHeight: 1.5 }}>
              Restricted to authorised tournament administrators only.
            </p>
          </div>

          <Link href="/" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontSize: 12, color: '#4a6a82', textDecoration: 'none', fontWeight: 600,
            transition: 'color .2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#8b9db7'}
            onMouseLeave={e => e.currentTarget.style.color = '#4a6a82'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Homepage
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .login-left { display: none !important; }
          .login-mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
}
