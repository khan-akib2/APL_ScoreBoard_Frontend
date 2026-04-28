'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

/* ─── static data ─────────────────────────────────────────────────────────── */
const TEAMS = [
  { name: 'Royal Challengers', group: 'A' },
  { name: 'Axion',             group: 'A' },
  { name: 'Syndicate',         group: 'A' },
  { name: '404 NOT FOUND',     group: 'A' },
  { name: '401 UNAUTHORISED',  group: 'B' },
  { name: 'Strikers',          group: 'B' },
  { name: 'Chase Masters',     group: 'B' },
  { name: 'Elite Warriors',    group: 'B' },
];

const STATS = [
  { value: '8',   label: 'Teams' },
  { value: '56',  label: 'Players' },
  { value: '2',   label: 'Grounds' },
  { value: 'T5',  label: 'Format' },
  { value: '3',   label: 'Stages' },
];

const FEATURES = [
  {
    title: 'Live Ball-by-Ball',
    desc: 'Every delivery tracked in real time — runs, wickets, extras, and full commentary as it happens.',
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  },
  {
    title: 'Full Scorecards',
    desc: 'Batting and bowling scorecards with strike rates, economy, fall of wickets, and partnerships.',
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  },
  {
    title: 'Live Standings',
    desc: 'Points table with NRR, wins, losses and qualification status updated after every match.',
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
  {
    title: 'Knockout Bracket',
    desc: 'Group stage feeds into semi-finals and a grand final. Follow every stage of the tournament.',
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  },
  {
    title: 'Match Schedule',
    desc: 'Full fixture list with dates, grounds, toss details and match status at a glance.',
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    title: 'Secure Admin Panel',
    desc: 'JWT-protected scoring panel for live input, undo, extras, wickets and complete match management.',
    svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
];

const FORMAT = [
  { step: '01', title: 'Group Stage',  desc: '8 teams split into 2 groups of 4. Each team plays 3 matches in a round-robin format.' },
  { step: '02', title: 'Semi Finals',  desc: 'Top 2 teams from each group advance. 4 teams compete in 2 knockout semi-finals.' },
  { step: '03', title: 'Grand Final',  desc: 'The last two standing battle it out in the grand final for the APL Season 8 trophy.' },
];

/* ─── component ───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role === 'admin') router.replace('/admin');
  }, [user, loading, router]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060e1a' }}>
      <div style={{ width: 32, height: 32, border: '2px solid rgba(201,162,39,0.2)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#060e1a', color: '#e8e8e8', fontFamily: 'var(--font-inter)', overflowX: 'hidden' }}>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 64,
        background: 'rgba(6,14,26,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(201,162,39,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image src="/logo.png" alt="APL" width={36} height={36} unoptimized style={{ objectFit: 'contain' }} />
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#c9a227', letterSpacing: '0.1em', lineHeight: 1.2 }}>APL SCOREBOARD</p>
            <p style={{ fontSize: 9, color: '#4a6a82', letterSpacing: '0.1em', fontWeight: 600 }}>SEASON 8 · 2026</p>
          </div>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { href: '/matches',              label: 'Matches'   },
            { href: '/dashboard?tab=standings', label: 'Standings' },
          ].map(n => (
            <Link key={n.href} href={n.href} style={{
              fontSize: 13, color: '#8b9db7', textDecoration: 'none',
              padding: '8px 16px', borderRadius: 8,
              transition: 'color .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#c9a227'}
              onMouseLeave={e => e.currentTarget.style.color = '#8b9db7'}
            >{n.label}</Link>
          ))}
          <Link href="/dashboard" style={{
            marginLeft: 8, fontSize: 13, fontWeight: 700, color: '#060e1a',
            background: '#c9a227', textDecoration: 'none',
            padding: '9px 22px', borderRadius: 8,
            transition: 'background .2s',
          }}>Live Scores</Link>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px' }}>

        {/* Grid texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(201,162,39,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Radial glow */}
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(201,162,39,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 820 }}>

          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100, marginBottom: 36,
            border: '1px solid rgba(201,162,39,0.25)',
            background: 'rgba(201,162,39,0.05)',
            fontSize: 11, fontWeight: 700, color: '#c9a227', letterSpacing: '0.12em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', display: 'inline-block' }} />
            LIVE NOW · APL SEASON 8 · 2026
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(40px, 7.5vw, 80px)',
            fontWeight: 900, lineHeight: 1.05,
            letterSpacing: '-0.04em', marginBottom: 28,
          }}>
            <span style={{ display: 'block', color: '#e8e8e8' }}>The Premier</span>
            <span style={{
              display: 'block',
              background: 'linear-gradient(135deg, #f3c570 0%, #c9a227 50%, #a07c1a 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Cricket Tournament</span>
            <span style={{ display: 'block', color: '#e8e8e8' }}>Is Live</span>
          </h1>

          <p style={{ fontSize: 18, color: '#8b9db7', maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.75 }}>
            8 teams. 2 groups. 1 champion. Follow every ball, every wicket, every moment — in real time.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80 }}>
            <Link href="/dashboard" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: 'linear-gradient(135deg, #d4a82a, #c9a227)',
              color: '#060e1a', textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(201,162,39,0.25)',
              transition: 'transform .2s, box-shadow .2s',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              View Live Scores
            </Link>
            <Link href="/matches" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: 'transparent', color: '#c9a227', textDecoration: 'none',
              border: '1px solid rgba(201,162,39,0.35)',
              transition: 'border-color .2s, background .2s',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Full Schedule
            </Link>
            <Link href="/dashboard?tab=standings" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: 'transparent', color: '#8b9db7', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.08)',
              transition: 'border-color .2s',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Standings
            </Link>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'inline-grid',
            gridTemplateColumns: `repeat(${STATS.length}, 1fr)`,
            border: '1px solid rgba(201,162,39,0.12)',
            borderRadius: 16, overflow: 'hidden',
            background: 'rgba(10,22,40,0.6)',
            backdropFilter: 'blur(12px)',
          }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{
                padding: '22px 28px', textAlign: 'center',
                borderRight: i < STATS.length - 1 ? '1px solid rgba(201,162,39,0.08)' : 'none',
              }}>
                <p style={{ fontSize: 30, fontWeight: 900, color: '#c9a227', lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</p>
                <p style={{ fontSize: 10, color: '#4a6a82', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tournament Format ──────────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <SectionLabel>Tournament Format</SectionLabel>
        <SectionTitle>How the Tournament Works</SectionTitle>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2, marginTop: 48, border: '1px solid rgba(201,162,39,0.1)', borderRadius: 16, overflow: 'hidden' }}>
          {FORMAT.map((f, i) => (
            <div key={f.step} style={{
              padding: '40px 36px',
              background: i === 1 ? 'rgba(201,162,39,0.04)' : 'rgba(10,22,40,0.4)',
              borderRight: i < FORMAT.length - 1 ? '1px solid rgba(201,162,39,0.08)' : 'none',
              position: 'relative',
            }}>
              <p style={{ fontSize: 56, fontWeight: 900, color: 'rgba(201,162,39,0.08)', lineHeight: 1, marginBottom: 20, letterSpacing: '-0.04em' }}>{f.step}</p>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e8e8e8', marginBottom: 12, letterSpacing: '-0.01em' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#8b9db7', lineHeight: 1.7 }}>{f.desc}</p>
              {i === 1 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />}
            </div>
          ))}
        </div>
      </section>

      {/* ── Teams ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 100px', maxWidth: 1000, margin: '0 auto' }}>
        <SectionLabel>Competing Teams</SectionLabel>
        <SectionTitle>8 Teams. 2 Groups. 1 Trophy.</SectionTitle>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20, marginTop: 48 }}>
          {['A', 'B'].map((grp) => (
            <div key={grp} style={{
              border: '1px solid rgba(201,162,39,0.1)',
              borderRadius: 16, overflow: 'hidden',
              background: 'rgba(10,22,40,0.4)',
            }}>
              {/* Group header */}
              <div style={{
                padding: '20px 28px',
                background: 'rgba(201,162,39,0.06)',
                borderBottom: '1px solid rgba(201,162,39,0.1)',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'linear-gradient(135deg, #d4a82a, #a07c1a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 900, color: '#060e1a',
                }}>{grp}</div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#e8e8e8' }}>Group {grp}</p>
                  <p style={{ fontSize: 11, color: '#4a6a82', marginTop: 1 }}>4 teams · Round Robin</p>
                </div>
              </div>
              {/* Team rows */}
              <div style={{ padding: '12px 16px' }}>
                {TEAMS.filter(t => t.group === grp).map((t, i) => (
                  <div key={t.name} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '13px 12px', borderRadius: 10,
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'rgba(201,162,39,0.08)',
                      border: '1px solid rgba(201,162,39,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: '#c9a227',
                    }}>{i + 1}</div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#e8e8e8' }}>{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 100px', maxWidth: 1000, margin: '0 auto' }}>
        <SectionLabel>Platform Features</SectionLabel>
        <SectionTitle>Everything You Need to Follow the Action</SectionTitle>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 16, marginTop: 48 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{
              padding: '32px 28px',
              border: '1px solid rgba(201,162,39,0.08)',
              borderRadius: 14,
              background: 'rgba(10,22,40,0.5)',
              transition: 'border-color .25s, transform .25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.25)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 12,
                background: 'rgba(201,162,39,0.07)',
                border: '1px solid rgba(201,162,39,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#c9a227', marginBottom: 20,
              }}>{f.svg}</div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#e8e8e8', marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#8b9db7', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 100px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{
          borderRadius: 20, padding: '64px 48px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
          border: '1px solid rgba(201,162,39,0.15)',
          background: 'linear-gradient(135deg, rgba(201,162,39,0.08) 0%, rgba(10,22,40,0.8) 60%)',
        }}>
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,162,39,0.1), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,162,39,0.06), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 100, border: '1px solid rgba(201,162,39,0.25)', fontSize: 10, fontWeight: 700, color: '#c9a227', letterSpacing: '0.12em', marginBottom: 24 }}>
              SEASON 8 · NOW LIVE
            </div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, color: '#e8e8e8', marginBottom: 16, letterSpacing: '-0.03em' }}>
              Don't Miss a Single Ball
            </h2>
            <p style={{ fontSize: 16, color: '#8b9db7', maxWidth: 440, margin: '0 auto 36px', lineHeight: 1.7 }}>
              Follow the live action, check standings, and track your favourite team — all in one place.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/dashboard" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 30px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                background: 'linear-gradient(135deg, #d4a82a, #c9a227)',
                color: '#060e1a', textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(201,162,39,0.2)',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Open Scoreboard
              </Link>
              <Link href="/dashboard?tab=standings" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 30px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                background: 'transparent', color: '#c9a227', textDecoration: 'none',
                border: '1px solid rgba(201,162,39,0.3)',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                View Standings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(201,162,39,0.08)',
        padding: '28px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image src="/logo.png" alt="APL" width={24} height={24} unoptimized style={{ objectFit: 'contain', opacity: 0.6 }} />
          <span style={{ fontSize: 11, color: '#4a6a82', fontWeight: 600, letterSpacing: '0.08em' }}>APL SCOREBOARD · SEASON 8 · 2026</span>
        </div>
        <Link href="/admin/login" style={{ fontSize: 11, color: '#4a6a82', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.06em', transition: 'color .2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#c9a227'}
          onMouseLeave={e => e.currentTarget.style.color = '#4a6a82'}
        >Admin Panel →</Link>
      </footer>

    </div>
  );
}

/* ─── helpers ─────────────────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a227', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
      {children}
    </p>
  );
}
function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900, color: '#e8e8e8', letterSpacing: '-0.03em', textAlign: 'center', lineHeight: 1.15 }}>
      {children}
    </h2>
  );
}
