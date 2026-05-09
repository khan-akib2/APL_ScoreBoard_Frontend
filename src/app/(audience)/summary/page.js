'use client';
import { useEffect, useState, useMemo } from 'react';
import UserLayout from '@/components/UserLayout';
import { api } from '@/services/api';
import { oversDisplay } from '@/utils/cricket';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// SVG icon components
const IconBat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21l9-9"/><path d="M12.5 7.5l4 4"/><path d="M15 6l3-3 3 3-3 3-3-3z"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconBolt = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconStadium = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="12" rx="10" ry="5"/><path d="M2 12v5c0 2.76 4.48 5 10 5s10-2.24 10-5v-5"/>
  </svg>
);
const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconTarget = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconSix = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>
  </svg>
);
const IconFour = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M3 9h18"/>
  </svg>
);
const IconTrophy = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);

function StatCard({ icon, label, value, sub, highlight }) {
  return (
    <div style={{
      padding: '18px 20px', borderRadius: 14,
      background: highlight ? 'linear-gradient(135deg, rgba(201,162,39,0.1), rgba(201,162,39,0.04))' : 'var(--bg-card)',
      border: `1px solid ${highlight ? 'rgba(201,162,39,0.25)' : 'var(--border-subtle)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ color: highlight ? 'var(--gold)' : 'var(--text-muted)', flexShrink: 0 }}>{icon}</div>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{label}</p>
      </div>
      <p style={{ fontSize: 28, fontWeight: 900, color: highlight ? 'var(--gold)' : 'var(--text-primary)', fontFamily: 'var(--font-bebas)', lineHeight: 1, marginBottom: sub ? 4 : 0 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

function MatchRow({ match, isLive }) {
  const teamA = match.teamA?.name || 'TBA';
  const teamB = match.teamB?.name || 'TBA';
  const winner = match.result?.winner?.name;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderRadius: 10,
      background: isLive ? 'rgba(239,68,68,0.06)' : 'var(--bg-card)',
      border: `1px solid ${isLive ? 'rgba(239,68,68,0.2)' : 'var(--border-subtle)'}`,
    }}>
      {isLive && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 9, fontWeight: 800, color: '#ef4444', letterSpacing: '0.1em' }}>LIVE</span>
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: winner === teamA ? 'var(--gold)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teamA}</p>
        <span style={{ fontSize: 10, color: 'var(--text-dim)', flexShrink: 0 }}>vs</span>
        <p style={{ fontSize: 13, fontWeight: 700, color: winner === teamB ? 'var(--gold)' : 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teamB}</p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {winner
          ? <p style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>{winner} won</p>
          : <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(match.date)}</p>
        }
        <p style={{ fontSize: 10, color: 'var(--text-dim)' }}>{match.group}</p>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12, marginTop: 28 }}>
      {children}
    </p>
  );
}

export default function SummaryPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let controller = new AbortController();
    const load = async () => {
      const d = await api.get('/matches', controller.signal);
      if (Array.isArray(d)) setMatches(d);
      setLoading(false);
    };
    load();
    const t = setInterval(load, 10000);
    return () => { controller.abort(); clearInterval(t); };
  }, []);

  const computed = useMemo(() => {
    const completed  = matches.filter(m => m.status === 'completed');
    const live       = matches.filter(m => m.status === 'live');
    const scheduled  = matches.filter(m => m.status === 'scheduled');
    const total      = matches.length;
    const played     = completed.length;

    let highTeamTotal = 0, highTeamMatch = '', highIndScore = 0, highIndName = '', highIndTeam = '';
    let bestWickets = 0, bestWicketsName = '', bestWicketsRuns = 999;
    let mostSixes = 0, mostFoursCount = 0;

    for (const m of completed) {
      for (const inn of [m.innings1, m.innings2].filter(Boolean)) {
        // Highest team total
        if ((inn.runs || 0) > highTeamTotal) {
          highTeamTotal = inn.runs || 0;
          const battingTeam = inn.team
            ? (m.teamA?._id?.toString() === inn.team?.toString() ? m.teamA?.name : m.teamB?.name)
            : '';
          highTeamMatch = `${battingTeam || ''} (${oversDisplay(inn.overs || 0, inn.balls || 0)} ov)`;
        }
        // Individual scores
        for (const b of (inn.batting || [])) {
          if ((b.runs || 0) > highIndScore) {
            highIndScore = b.runs || 0;
            highIndName  = b.player?.name || '—';
            highIndTeam  = '';
          }
          mostSixes     += b.sixes || 0;
          mostFoursCount += b.fours || 0;
        }
        // Bowling figures
        for (const b of (inn.bowling || [])) {
          if ((b.wickets || 0) > bestWickets ||
             ((b.wickets || 0) === bestWickets && (b.runs || 0) < bestWicketsRuns)) {
            bestWickets     = b.wickets || 0;
            bestWicketsRuns = b.runs    || 0;
            bestWicketsName = b.player?.name || '—';
          }
        }
      }
    }

    const recent   = [...completed].reverse().slice(0, 5);
    const upcoming = scheduled.slice(0, 5);

    return { played, total, live, upcoming, recent, highTeamTotal, highTeamMatch, highIndScore, highIndName, bestWickets, bestWicketsRuns, bestWicketsName, mostSixes, mostFoursCount };
  }, [matches]);

  return (
    <UserLayout>
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '16px 16px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 100, background: 'rgba(201,162,39,0.08)', border: '1px solid var(--border-default)', fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.14em', marginBottom: 14 }}>
              SEASON 8 · 2026
            </div>
            <h1 style={{ fontSize: 'clamp(26px,5vw,42px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>
              Tournament <span style={{ color: 'var(--gold)' }}>Summary</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Live tournament stats and overview</p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 32, height: 32, border: '2px solid var(--border-default)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
            </div>
          ) : (
            <>
              {/* Progress */}
              <SectionTitle>Tournament Progress</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 4 }}>
                <StatCard icon={<IconBat />} label="Matches Played" value={computed.played} sub={`of ${computed.total} total`} />
                <StatCard icon={<IconCalendar />} label="Remaining" value={Math.max(0, computed.total - computed.played - computed.live.length)} />
                <StatCard icon={<IconBolt />} label="Live Now" value={computed.live.length} highlight={computed.live.length > 0} />
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                <div style={{ height: '100%', width: `${computed.total > 0 ? (computed.played / computed.total) * 100 : 0}%`, background: 'linear-gradient(90deg, var(--gold), #d4a82a)', borderRadius: 3, transition: 'width .5s' }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8 }}>
                {computed.total > 0 ? Math.round((computed.played / computed.total) * 100) : 0}% complete
              </p>

              {/* Tournament records */}
              <SectionTitle>Tournament Records</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                <StatCard icon={<IconStadium />} label="Highest Team Total" value={computed.highTeamTotal || '—'} sub={computed.highTeamMatch || 'No data yet'} highlight={computed.highTeamTotal > 0} />
                <StatCard icon={<IconBat />} label="Highest Individual" value={computed.highIndScore || '—'} sub={computed.highIndName || 'No data yet'} highlight={computed.highIndScore > 0} />
                <StatCard icon={<IconTarget />} label="Best Bowling" value={computed.bestWickets > 0 ? `${computed.bestWickets}/${computed.bestWicketsRuns}` : '—'} sub={computed.bestWicketsName || 'No data yet'} highlight={computed.bestWickets > 0} />
                <StatCard icon={<IconSix />} label="Total Sixes" value={computed.mostSixes} />
                <StatCard icon={<IconFour />} label="Total Fours" value={computed.mostFoursCount} />
              </div>

              {/* Live matches */}
              {computed.live.length > 0 && (
                <>
                  <SectionTitle>Live Now</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {computed.live.map(m => <MatchRow key={m._id} match={m} isLive />)}
                  </div>
                </>
              )}

              {/* Recent results */}
              {computed.recent.length > 0 && (
                <>
                  <SectionTitle>Recent Results</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {computed.recent.map(m => <MatchRow key={m._id} match={m} />)}
                  </div>
                </>
              )}

              {/* Upcoming fixtures */}
              {computed.upcoming.length > 0 && (
                <>
                  <SectionTitle>Upcoming Fixtures</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {computed.upcoming.map(m => <MatchRow key={m._id} match={m} />)}
                  </div>
                </>
              )}

              {computed.played === 0 && computed.live.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16, marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: 'var(--gold)' }}><IconTrophy /></div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Tournament hasn't started yet</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Stats will appear as matches are played</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
