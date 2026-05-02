'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const C = {
  bg0: '#060e1a', bg1: '#0a1628', bg2: '#0f1e35',
  border: 'rgba(255,255,255,0.07)',
  gold: '#c9a227', green: '#22c55e', red: '#ef4444', blue: '#60a5fa',
  text: '#e8e8e8', muted: '#8b9db7', dim: '#4a6a82',
};

const RANK_COLORS = [C.gold, '#c0c0c0', '#cd7f32'];

function QualBadge({ q }) {
  if (q === 'winner')   return <span style={{ fontSize: 9, fontWeight: 800, color: C.green,  padding: '3px 7px', borderRadius: 4, background: 'rgba(34,197,94,0.1)',  border: '1px solid rgba(34,197,94,0.25)',  letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>GW</span>;
  if (q === 'wildcard') return <span style={{ fontSize: 9, fontWeight: 800, color: C.blue,   padding: '3px 7px', borderRadius: 4, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)',  letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>WC</span>;
  return                       <span style={{ fontSize: 9, fontWeight: 700, color: C.dim,    padding: '3px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`,           letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>OUT</span>;
}

export default function AdminLeaderboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [recalcing, setRecalcing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
    else if (!loading && user) load();
  }, [loading, user]);

  const load = async () => {
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
    load();
  };

  useEffect(() => {
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <AdminLayout>
      <div className="admin-page-pad">

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>Live Rankings</p>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, letterSpacing: '-0.02em', marginBottom: 4 }}>Leaderboard</h1>
            <p style={{ fontSize: 13, color: C.dim }}>All teams ranked by points · NRR tiebreaker</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {lastUpdated && (
              <p style={{ fontSize: 11, color: C.dim }}>
                {refreshing ? 'Updating…' : `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
              </p>
            )}
            <button onClick={load} disabled={refreshing} style={{
              padding: '8px 14px', borderRadius: 8, border: `1px solid ${C.border}`,
              background: 'rgba(255,255,255,0.04)', color: C.muted,
              cursor: refreshing ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: refreshing ? 'spin .8s linear infinite' : 'none' }}>
                <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Refresh
            </button>
            <button onClick={recalcStats} disabled={recalcing} style={{
              padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(201,162,39,0.25)',
              background: 'rgba(201,162,39,0.08)', color: C.gold,
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

        {/* ── Table card ── */}
        <div style={{ background: C.bg1, border: '1px solid rgba(201,162,39,0.15)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>

          {/* Title bar */}
          <div style={{ padding: '12px 16px', background: `linear-gradient(135deg, ${C.bg2}, ${C.bg1})`, borderBottom: `1px solid rgba(201,162,39,0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(239,68,68,0.55)' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,165,0,0.45)' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(34,197,94,0.45)' }} />
              </div>
              <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)' }} />
              <p style={{ fontSize: 11, fontWeight: 600, color: C.dim, letterSpacing: '0.08em' }}>STANDINGS · {teams.length} TEAMS</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: refreshing ? C.gold : C.green, display: 'inline-block', animation: refreshing ? 'pulse 1s ease-in-out infinite' : 'none' }} />
              <span style={{ fontSize: 10, color: C.dim, fontWeight: 600 }}>{refreshing ? 'SYNCING' : 'LIVE'}</span>
            </div>
          </div>

          {/* Scrollable table — everything inside one scroll container */}
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.25)', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                  {[
                    { label: '#',      align: 'left',   w: 44  },
                    { label: 'Team',   align: 'left',   w: null },
                    { label: 'P',      align: 'center', w: 40  },
                    { label: 'W',      align: 'center', w: 40  },
                    { label: 'L',      align: 'center', w: 40  },
                    { label: 'Pts',    align: 'center', w: 56  },
                    { label: 'NRR',    align: 'center', w: 72  },
                    { label: 'Status', align: 'center', w: 90  },
                  ].map(h => (
                    <th key={h.label} style={{ padding: '8px 10px', fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: h.align, width: h.w || undefined, whiteSpace: 'nowrap' }}>
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teams.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '48px 24px', textAlign: 'center', color: C.dim, fontSize: 13 }}>No data yet</td></tr>
                ) : teams.map((team, i) => {
                  const q = team.qualification;
                  const isFirst = i === 0;
                  const rc = i < 3 ? RANK_COLORS[i] : C.dim;
                  return (
                    <tr key={team._id} style={{
                      borderBottom: i < teams.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none',
                      background: isFirst ? 'rgba(201,162,39,0.04)' : 'transparent',
                      borderLeft: isFirst ? `3px solid rgba(201,162,39,0.4)` : '3px solid transparent',
                      transition: 'background .15s',
                    }}
                      onMouseEnter={e => { if (!isFirst) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                      onMouseLeave={e => { if (!isFirst) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Rank */}
                      <td style={{ padding: '13px 10px', paddingLeft: isFirst ? 7 : 10 }}>
                        <span style={{
                          fontSize: 13, fontWeight: 900, color: rc,
                          fontFamily: 'var(--font-bebas)',
                          ...(i < 3 ? {
                            width: 24, height: 24, borderRadius: '50%',
                            background: `${rc}18`, border: `1px solid ${rc}40`,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          } : {}),
                        }}>{i + 1}</span>
                      </td>

                      {/* Team */}
                      <td style={{ padding: '13px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                            background: isFirst ? 'rgba(201,162,39,0.15)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${isFirst ? 'rgba(201,162,39,0.3)' : C.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 900, color: isFirst ? C.gold : C.dim,
                            fontFamily: 'var(--font-bebas)',
                          }}>{team.group}</div>
                          <span style={{ fontSize: 13, fontWeight: isFirst ? 800 : 600, color: isFirst ? C.text : '#c8d4e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                            {team.name}
                          </span>
                        </div>
                      </td>

                      {/* P */}
                      <td style={{ padding: '13px 10px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: C.muted }}>{team.stats.played}</td>

                      {/* W */}
                      <td style={{ padding: '13px 10px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: C.green }}>{team.stats.won}</td>

                      {/* L */}
                      <td style={{ padding: '13px 10px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: C.red }}>{team.stats.lost}</td>

                      {/* Pts */}
                      <td style={{ padding: '13px 10px', textAlign: 'center' }}>
                        <span style={{ fontSize: 15, fontWeight: 900, color: C.gold, fontFamily: 'var(--font-bebas)', padding: '2px 8px', borderRadius: 5, background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)' }}>
                          {team.stats.points}
                        </span>
                      </td>

                      {/* NRR */}
                      <td style={{ padding: '13px 10px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: C.muted, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                        {(team.stats.nrr ?? 0) >= 0 ? '+' : ''}{(team.stats.nrr ?? 0).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '13px 10px', textAlign: 'center' }}>
                        <QualBadge q={q} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            <div style={{ padding: '9px 16px', borderTop: `1px solid rgba(255,255,255,0.05)`, background: 'rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, fontSize: 11, color: C.dim, minWidth: 520 }}>
              <span>Win = 2 pts · Loss = 0 pts · NRR tiebreaker</span>
              <span>GW = Group Winner · WC = Wildcard</span>
            </div>
          </div>
        </div>

      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </AdminLayout>
  );
}
