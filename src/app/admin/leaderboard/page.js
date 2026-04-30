'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

export default function AdminLeaderboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [recalcing, setRecalcing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
    else if (!loading && user) fetch();
  }, [loading, user]);

  const fetch = async () => {
    setRefreshing(true);
    const data = await api.get('/standings/leaderboard');
    if (Array.isArray(data)) setTeams(data);
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  const recalcStats = async () => {
    setRecalcing(true);
    await api.post('/matches/recalc-stats', {});
    setRecalcing(false);
    fetch();
  };

  // Auto-refresh every 10s
  useEffect(() => {
    const t = setInterval(fetch, 10000);
    return () => clearInterval(t);
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <AdminLayout>
      <div className="admin-page-pad">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#c9a227', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>Live Rankings</p>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#e8e8e8', letterSpacing: '-0.02em', marginBottom: 4 }}>Leaderboard</h1>
            <p style={{ fontSize: 13, color: '#4a6a82' }}>All teams ranked by points · NRR tiebreaker</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {lastUpdated && (
              <p style={{ fontSize: 11, color: '#4a6a82' }}>
                {refreshing ? 'Updating…' : `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
              </p>
            )}
            <button onClick={fetch} disabled={refreshing} style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.04)', color: '#8b9db7',
              cursor: refreshing ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: refreshing ? 'spin .8s linear infinite' : 'none' }}>
                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Refresh
            </button>
            <button onClick={recalcStats} disabled={recalcing} style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(201,162,39,0.25)',
              background: 'rgba(201,162,39,0.08)', color: '#c9a227',
              cursor: recalcing ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: recalcing ? 'spin .8s linear infinite' : 'none' }}>
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              {recalcing ? 'Recalculating…' : 'Recalc NRR & Stats'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: '#0a1628',
          border: '1px solid rgba(201,162,39,0.15)',
          borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {/* Title bar */}
          <div style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #0f1e35, #0a1628)',
            borderBottom: '1px solid rgba(201,162,39,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(239,68,68,0.55)' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,165,0,0.45)' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(34,197,94,0.45)' }} />
              </div>
              <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)' }} />
              <p style={{ fontSize: 11, fontWeight: 600, color: '#4a6a82', letterSpacing: '0.08em' }}>STANDINGS · {teams.length} TEAMS</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: refreshing ? '#c9a227' : '#22c55e', display: 'inline-block', animation: refreshing ? 'pulse 1s ease-in-out infinite' : 'none' }} />
              <span style={{ fontSize: 10, color: '#4a6a82', fontWeight: 600 }}>{refreshing ? 'SYNCING' : 'LIVE'}</span>
            </div>
          </div>

          {/* Column headers */}
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '48px 1fr 60px 60px 60px 60px 80px 80px',
            padding: '9px 20px', background: 'rgba(0,0,0,0.2)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            minWidth: 560,
          }}>
            {['#', 'Team', 'P', 'W', 'L', 'Pts', 'NRR', 'Status'].map((h, i) => (
              <p key={h} style={{ fontSize: 10, fontWeight: 700, color: '#4a6a82', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: i > 1 ? 'center' : 'left' }}>{h}</p>
            ))}
          </div>

          {/* Rows */}
          {teams.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#4a6a82', fontSize: 13 }}>No data yet</div>
          ) : teams.map((team, i) => {
            const q = team.qualification; // 'winner' | 'wildcard' | 'eliminated'
            const isWinner   = q === 'winner';
            const isWildcard = q === 'wildcard';
            const isOut      = q === 'eliminated';
            const isFirst = i === 0;
            return (
              <div key={team._id} style={{
                display: 'grid', gridTemplateColumns: '48px 1fr 60px 60px 60px 60px 80px 80px',
                padding: '14px 20px',
                borderBottom: i < teams.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: isFirst ? 'rgba(201,162,39,0.04)' : 'transparent',
                borderLeft: isFirst ? '2px solid rgba(201,162,39,0.4)' : '2px solid transparent',
                transition: 'background .15s',
                minWidth: 560,
              }}
                onMouseEnter={e => { if (!isFirst) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={e => { if (!isFirst) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Rank */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {i < 3 ? (
                    <span style={{ fontSize: 16 }}>{medals[i]}</span>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#4a6a82', fontFamily: 'var(--font-bebas)' }}>{i + 1}</span>
                  )}
                </div>

                {/* Team */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                    background: isFirst ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isFirst ? 'rgba(201,162,39,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 900, color: isFirst ? '#c9a227' : '#4a6a82',
                    fontFamily: 'var(--font-bebas)',
                  }}>{team.group}</div>
                  <p style={{ fontSize: 14, fontWeight: isFirst ? 800 : 600, color: isFirst ? '#e8e8e8' : '#c8d4e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {team.name}
                  </p>
                </div>

                {/* Stats */}
                {[team.stats.played, team.stats.won, team.stats.lost].map((v, j) => (
                  <p key={j} style={{ fontSize: 13, fontWeight: 600, color: j === 1 ? '#22c55e' : j === 2 ? '#ef4444' : '#8b9db7', textAlign: 'center', alignSelf: 'center' }}>{v}</p>
                ))}

                {/* Points */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{
                    fontSize: 15, fontWeight: 900, color: '#c9a227',
                    fontFamily: 'var(--font-bebas)',
                    padding: '3px 10px', borderRadius: 6,
                    background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)',
                  }}>{team.stats.points}</span>
                </div>

                {/* NRR */}
                <p style={{ fontSize: 12, fontWeight: 600, color: '#8b9db7', textAlign: 'center', alignSelf: 'center', fontFamily: 'monospace' }}>
                  {team.stats.nrr >= 0 ? '+' : ''}{team.stats.nrr?.toFixed(2) || '0.00'}
                </p>

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isWinner ? (
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#22c55e', padding: '3px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', letterSpacing: '0.08em' }}>GROUP WINNER</span>
                  ) : isWildcard ? (
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#60a5fa', padding: '3px 8px', borderRadius: 4, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', letterSpacing: '0.08em' }}>WILDCARD</span>
                  ) : (
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#4a6a82', padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', letterSpacing: '0.06em' }}>ELIMINATED</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div style={{ padding: '9px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, fontSize: 11, color: '#4a6a82', minWidth: 560 }}>
            <span>Win = 2 pts · Loss = 0 pts · NRR tiebreaker</span>
            <span>GW = Group Winner · WC = Wildcard (Best NRR across groups)</span>
          </div>
          </div>{/* end scroll wrapper */}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </AdminLayout>
  );
}
