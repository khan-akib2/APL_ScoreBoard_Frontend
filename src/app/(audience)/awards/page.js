'use client';
import { useEffect, useState } from 'react';
import UserLayout from '@/components/UserLayout';
import { api } from '@/services/api';

// ── Award display metadata ────────────────────────────────────────────────────
const AWARD_META = {
  winner:            { label: 'Tournament Winner',      sub: 'Champions of APL Season 8',               icon: 'trophy',  gender: null,     color: 'gold'   },
  runnerUp:          { label: 'Runner Up',              sub: 'Runners-up of APL Season 8',              icon: 'medal',   gender: null,     color: 'silver' },
  bestBatsmanMale:   { label: 'Best Batsman',           sub: 'Men — Most runs in the tournament',       icon: 'bat',     gender: 'male',   color: 'blue'   },
  bestBatsmanFemale: { label: 'Best Batswoman',         sub: 'Women — Most runs in the tournament',     icon: 'bat',     gender: 'female', color: 'pink'   },
  bestBowlerMale:    { label: 'Best Bowler',            sub: 'Men — Most wickets in the tournament',    icon: 'target',  gender: 'male',   color: 'blue'   },
  bestBowlerFemale:  { label: 'Best Bowler',            sub: 'Women — Most wickets in the tournament',  icon: 'target',  gender: 'female', color: 'pink'   },
  manOfSeries:       { label: 'Man of the Series',      sub: 'Best overall male performer — points',    icon: 'star',    gender: 'male',   color: 'blue'   },
  womanOfSeries:     { label: 'Woman of the Series',    sub: 'Best overall female performer — points',  icon: 'star',    gender: 'female', color: 'pink'   },
  mostSixes:         { label: 'Most Sixes',             sub: 'Most sixes hit in the tournament',        icon: 'six',     gender: null,     color: 'gold'   },
  mostFours:         { label: 'Most Fours',             sub: 'Most fours hit in the tournament',        icon: 'four',    gender: null,     color: 'gold'   },
  bestFielder:       { label: 'Best Fielder',           sub: 'Most dismissals (catches + run-outs)',     icon: 'glove',   gender: null,     color: 'gold'   },
};

const AWARD_ICONS = {
  trophy: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  medal:  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  bat:    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l9-9"/><path d="M12.5 7.5l4 4"/><path d="M15 6l3-3 3 3-3 3-3-3z"/></svg>,
  target: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  star:   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  six:    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>,
  four:   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M3 9h18"/></svg>,
  glove:  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>,
};

// Section grouping
const SECTIONS = [
  {
    title: 'Tournament Honours',
    keys: ['winner', 'runnerUp'],
  },
  {
    title: 'Men\'s Awards',
    genderTag: 'male',
    keys: ['bestBatsmanMale', 'bestBowlerMale', 'manOfSeries'],
  },
  {
    title: 'Women\'s Awards',
    genderTag: 'female',
    keys: ['bestBatsmanFemale', 'bestBowlerFemale', 'womanOfSeries'],
  },
  {
    title: 'Special Awards',
    keys: ['mostSixes', 'mostFours', 'bestFielder'],
  },
];

const colorMap = {
  gold:   { bg: 'rgba(201,162,39,0.1)', border: 'rgba(201,162,39,0.3)', text: '#c9a227' },
  silver: { bg: 'rgba(192,192,192,0.08)', border: 'rgba(192,192,192,0.25)', text: '#c0c0c0' },
  blue:   { bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', text: '#60a5fa' },
  pink:   { bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.2)', text: '#f472b6' },
};

function AwardStats({ award, awardKey }) {
  const parts = [];
  if (award.runs      !== undefined && award.runs      !== null) parts.push({ label: 'Runs', value: award.runs });
  if (award.average   !== undefined && award.average   !== null) parts.push({ label: 'Avg', value: award.average });
  if (award.strikeRate!== undefined && award.strikeRate!== null) parts.push({ label: 'SR', value: award.strikeRate });
  if (award.wickets   !== undefined && award.wickets   !== null) parts.push({ label: 'Wickets', value: award.wickets });
  if (award.economy   !== undefined && award.economy   !== null) parts.push({ label: 'Economy', value: award.economy });
  if (award.oversBowled !== undefined && award.oversBowled !== null) parts.push({ label: 'Overs', value: award.oversBowled });
  if (award.sixes     !== undefined && award.sixes     !== null) parts.push({ label: 'Sixes', value: award.sixes });
  if (award.fours     !== undefined && award.fours     !== null) parts.push({ label: 'Fours', value: award.fours });
  if (award.catches   !== undefined && award.catches   !== null) parts.push({ label: 'Catches', value: award.catches });
  if (award.runOuts   !== undefined && award.runOuts   !== null) parts.push({ label: 'Run-outs', value: award.runOuts });
  if (award.totalDismissals !== undefined && award.totalDismissals !== null) parts.push({ label: 'Total', value: award.totalDismissals });

  // Man/Woman of Series: show point breakdown
  if (award.totalPoints !== undefined && award.totalPoints !== null) {
    return (
      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 14px', borderRadius: 8, background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.25)' }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-bebas)' }}>{award.totalPoints}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pts</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>{award.totalRuns}</strong> runs → <strong style={{ color: 'var(--gold)' }}>{award.runsPoints} pts</strong>
            <span style={{ color: 'var(--text-dim)', fontSize: 10 }}> (÷30)</span>
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>{award.totalWickets}</strong> wickets → <strong style={{ color: 'var(--gold)' }}>{award.wicketPoints} pts</strong>
          </span>
        </div>
      </div>
    );
  }

  if (parts.length === 0) return null;
  return (
    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {parts.map(p => (
        <div key={p.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 12px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', minWidth: 48 }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-bebas)' }}>{p.value}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{p.label}</span>
        </div>
      ))}
    </div>
  );
}

function AwardCard({ awardKey, award }) {
  const meta = AWARD_META[awardKey];
  if (!meta || !award?.player) return null;
  const c = colorMap[meta.color] || colorMap.gold;
  const isWinner = awardKey === 'winner';

  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      background: 'var(--bg-card)',
      border: `1px solid ${isWinner ? c.border : 'var(--border-subtle)'}`,
      boxShadow: isWinner ? `0 4px 24px ${c.bg}` : 'none',
    }}>
      {/* Card header */}
      <div style={{
        padding: '14px 20px',
        background: isWinner ? c.bg : 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 3 }}>{meta.sub}</p>
          <p style={{ fontSize: 15, fontWeight: 900, color: isWinner ? c.text : 'var(--text-primary)', letterSpacing: '-0.01em' }}>{meta.label}</p>
        </div>
        <div style={{ color: c.text, flexShrink: 0 }}>{AWARD_ICONS[meta.icon]}</div>
      </div>

      {/* Card body */}
      <div style={{ padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: c.bg, border: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 900, color: c.text, fontFamily: 'var(--font-bebas)',
        }}>
          {award.player?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.01em', fontFamily: 'var(--font-bebas)', textTransform: 'uppercase', marginBottom: 2 }}>
            {award.player?.name || '—'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>{award.teamName}</p>
          <AwardStats award={award} awardKey={awardKey} />
        </div>
      </div>
    </div>
  );
}

function GenderBadge({ gender }) {
  if (!gender) return null;
  const isMale = gender === 'male';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 100, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
      background: isMale ? 'rgba(96,165,250,0.12)' : 'rgba(244,114,182,0.12)',
      color: isMale ? '#60a5fa' : '#f472b6',
      border: `1px solid ${isMale ? 'rgba(96,165,250,0.3)' : 'rgba(244,114,182,0.3)'}`,
    }}>
      {isMale ? '♂ Men' : '♀ Women'}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AwardsPage() {
  const [awards, setAwards] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await api.get('/awards');
      setAwards(data || {});
      setLoading(false);
    };
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const hasAny = Object.values(awards).some(v => v?.player);

  return (
    <UserLayout>
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '16px 16px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 100, background: 'rgba(201,162,39,0.08)', border: '1px solid var(--border-default)', fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.14em', marginBottom: 16 }}>
              APL SEASON 8 · 2026
            </div>
            <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 10 }}>
              Tournament <span style={{ color: 'var(--gold)' }}>Awards</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Official awards for APL Season 8 · Point system: 30 runs = 1 pt · 1 wicket = 1 pt</p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 32, height: 32, border: '2px solid var(--border-default)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : !hasAny ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: 'var(--gold)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Awards Coming Soon</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Awards will be revealed by the tournament admin after matches complete</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {SECTIONS.map(section => {
                const visibleKeys = section.keys.filter(k => awards[k]?.player);
                if (visibleKeys.length === 0) return null;
                return (
                  <div key={section.title}>
                    {/* Section header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{section.title}</p>
                      {section.genderTag && <GenderBadge gender={section.genderTag} />}
                      <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)', marginLeft: 4 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {visibleKeys.map(k => (
                        <AwardCard key={k} awardKey={k} award={awards[k]} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
