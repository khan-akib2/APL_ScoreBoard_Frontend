'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const C = {
  bg0: '#060e1a', bg1: '#0a1628', bg2: '#0f1e35',
  border: 'rgba(255,255,255,0.07)',
  gold: '#c9a227', goldDim: 'rgba(201,162,39,0.1)',
  red: '#ef4444', redDim: 'rgba(239,68,68,0.1)',
  green: '#22c55e', blue: '#60a5fa',
  text: '#e8e8e8', muted: '#8b9db7', dim: '#4a6a82',
};

/* ── tiny helpers ── */
const Panel = ({ children, style = {} }) => (
  <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', ...style }}>
    {children}
  </div>
);

const SectionHead = ({ children }) => (
  <div style={{ padding: '12px 20px', background: C.bg2, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
    <p style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{children}</p>
  </div>
);

const StatBox = ({ label, value, color = C.text, sub }) => (
  <div style={{ textAlign: 'center', padding: '16px 12px' }}>
    <p style={{ fontSize: 32, fontWeight: 900, color, lineHeight: 1, fontFamily: 'var(--font-bebas)' }}>{value}</p>
    {sub && <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</p>}
    <p style={{ fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>{label}</p>
  </div>
);

const ROLE_COLORS = {
  batsman:      { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)'  },
  bowler:       { color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)'  },
  allrounder:   { color: C.gold,   bg: C.goldDim,               border: 'rgba(201,162,39,0.3)'   },
  wicketkeeper: { color: C.green,  bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.25)'   },
};

export default function TeamDetailPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [team, setTeam]       = useState(null);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
    else if (!loading && user) load();
  }, [loading, user]);

  const load = async () => {
    setFetching(true);
    const [teams, allPlayers, allMatches] = await Promise.all([
      api.get('/teams'),
      api.get('/players'),
      api.get('/matches'),
    ]);
    const t = Array.isArray(teams) ? teams.find(t => t._id === id) : null;
    if (!t) { setFetching(false); return; }
    setTeam(t);
    setPlayers(Array.isArray(allPlayers) ? allPlayers.filter(p => p.team?._id === id || p.team === id) : []);
    setMatches(Array.isArray(allMatches) ? allMatches.filter(m =>
      m.teamA?._id === id || m.teamA === id || m.teamB?._id === id || m.teamB === id
    ) : []);
    setFetching(false);
  };

  if (fetching || !team) return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 32, height: 32, border: `2px solid ${C.goldDim}`, borderTopColor: C.gold, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </AdminLayout>
  );

  const completed = matches.filter(m => m.status === 'completed');
  const wins      = completed.filter(m => m.result?.winner?._id === id || m.result?.winner === id);
  const losses    = completed.filter(m => m.result?.winner && m.result.winner?._id !== id && m.result.winner !== id);
  const nrr       = (team.stats?.nrr ?? 0).toFixed(2);
  const captain   = players.find(p => p.isCaptain);

  /* aggregate player stats from completed matches */
  const playerStats = {};
  for (const m of completed) {
    for (const inn of [m.innings1, m.innings2].filter(Boolean)) {
      for (const b of (inn.batting || [])) {
        const pid = b.player?._id || b.player;
        if (!pid) continue;
        if (!playerStats[pid]) playerStats[pid] = { runs: 0, balls: 0, fours: 0, sixes: 0, wickets: 0, innings: 0, outs: 0 };
        playerStats[pid].runs   += b.runs  || 0;
        playerStats[pid].balls  += b.balls || 0;
        playerStats[pid].fours  += b.fours || 0;
        playerStats[pid].sixes  += b.sixes || 0;
        playerStats[pid].innings += 1;
        if (b.status === 'out') playerStats[pid].outs += 1;
      }
      for (const b of (inn.bowling || [])) {
        const pid = b.player?._id || b.player;
        if (!pid) continue;
        if (!playerStats[pid]) playerStats[pid] = { runs: 0, balls: 0, fours: 0, sixes: 0, wickets: 0, innings: 0, outs: 0 };
        playerStats[pid].wickets += b.wickets || 0;
      }
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page-pad" style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Back ── */}
        <Link href="/admin/teams" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.dim, textDecoration: 'none', marginBottom: 20, fontWeight: 600 }}
          onMouseEnter={e => e.currentTarget.style.color = C.gold}
          onMouseLeave={e => e.currentTarget.style.color = C.dim}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Teams
        </Link>

        {/* ── Team header ── */}
        <div style={{ background: `linear-gradient(135deg, ${C.bg2}, ${C.bg1})`, border: `1px solid rgba(201,162,39,0.2)`, borderRadius: 16, padding: '24px 28px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: C.goldDim, border: `1px solid rgba(201,162,39,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: C.gold, fontFamily: 'var(--font-bebas)', flexShrink: 0 }}>
              {team.group}
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>Group {team.group}</p>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: '-0.02em', marginBottom: 4 }}>{team.name}</h1>
              {captain && (
                <p style={{ fontSize: 12, color: C.muted }}>
                  Captain: <strong style={{ color: C.gold }}>{captain.name}</strong>
                  {team.captainEmail && <span style={{ color: C.dim, marginLeft: 8 }}>· {team.captainEmail}</span>}
                </p>
              )}
            </div>
          </div>
          {/* Qualification badge */}
          {team.qualification === 'winner' && (
            <span style={{ fontSize: 11, fontWeight: 800, color: C.green, padding: '6px 14px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', letterSpacing: '0.08em' }}>GROUP WINNER</span>
          )}
          {team.qualification === 'wildcard' && (
            <span style={{ fontSize: 11, fontWeight: 800, color: C.blue, padding: '6px 14px', borderRadius: 8, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', letterSpacing: '0.08em' }}>WILDCARD</span>
          )}
          {team.qualification === 'eliminated' && (
            <span style={{ fontSize: 11, fontWeight: 700, color: C.dim, padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, letterSpacing: '0.08em' }}>ELIMINATED</span>
          )}
        </div>

        {/* ── Stats strip ── */}
        <Panel style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', borderBottom: `1px solid ${C.border}` }} className="stat-strip-4">
            {[
              { label: 'Played',  value: team.stats?.played  || 0, color: C.text  },
              { label: 'Won',     value: team.stats?.won     || 0, color: C.green },
              { label: 'Lost',    value: team.stats?.lost    || 0, color: C.red   },
              { label: 'Points',  value: team.stats?.points  || 0, color: C.gold  },
              { label: 'NRR',     value: (team.stats?.nrr ?? 0) >= 0 ? `+${nrr}` : nrr, color: C.muted },
              { label: 'Players', value: players.length,            color: C.text  },
            ].map((s, i, arr) => (
              <div key={s.label} style={{ borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <StatBox label={s.label} value={s.value} color={s.color} />
              </div>
            ))}
          </div>
        </Panel>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="admin-grid-2">

          {/* ── Players ── */}
          <Panel>
            <SectionHead>Squad — {players.length} Players</SectionHead>
            {players.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: C.dim, fontSize: 13 }}>No players added yet</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: `1px solid ${C.border}` }}>
                      {['#', 'Name', 'Role', 'R', 'B', '4s', '6s', 'W'].map((h, i) => (
                        <th key={h} style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: i > 2 ? 'center' : 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((p, i) => {
                      const ps = playerStats[p._id] || {};
                      const rc = ROLE_COLORS[p.role] || ROLE_COLORS.batsman;
                      return (
                        <tr key={p._id} style={{ borderBottom: i < players.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '11px 12px', fontSize: 12, color: C.dim, fontWeight: 600 }}>{i + 1}</td>
                          <td style={{ padding: '11px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              {p.isCaptain && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill={C.gold} stroke="none" style={{ flexShrink: 0 }}>
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              )}
                              <div>
                                <p style={{ fontSize: 13, fontWeight: p.isCaptain ? 700 : 500, color: p.isCaptain ? C.gold : C.text }}>{p.name}</p>
                                <p style={{ fontSize: 10, color: C.dim }}>{p.gender === 'female' ? '♀' : '♂'}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '11px 12px' }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: rc.color, padding: '2px 7px', borderRadius: 4, background: rc.bg, border: `1px solid ${rc.border}`, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{p.role}</span>
                          </td>
                          <td style={{ padding: '11px 12px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: C.gold, fontFamily: 'var(--font-bebas)' }}>{ps.runs ?? 0}</td>
                          <td style={{ padding: '11px 12px', textAlign: 'center', fontSize: 12, color: C.muted }}>{ps.balls ?? 0}</td>
                          <td style={{ padding: '11px 12px', textAlign: 'center', fontSize: 12, color: C.blue }}>{ps.fours ?? 0}</td>
                          <td style={{ padding: '11px 12px', textAlign: 'center', fontSize: 12, color: C.gold }}>{ps.sixes ?? 0}</td>
                          <td style={{ padding: '11px 12px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: C.red, fontFamily: 'var(--font-bebas)' }}>{ps.wickets ?? 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {/* ── Match History ── */}
          <Panel>
            <SectionHead>Match History — {matches.length} Matches</SectionHead>
            {matches.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: C.dim, fontSize: 13 }}>No matches scheduled yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {matches.map((m, i) => {
                  const isTeamA  = m.teamA?._id === id || m.teamA === id;
                  const opponent = isTeamA ? m.teamB?.name : m.teamA?.name;
                  const won      = m.result?.winner?._id === id || m.result?.winner === id;
                  const lost     = m.result?.winner && !won;
                  const statusColor = m.status === 'live' ? C.red : m.status === 'completed' ? (won ? C.green : lost ? C.red : C.muted) : C.dim;
                  const statusLabel = m.status === 'live' ? 'LIVE' : m.status === 'completed' ? (won ? 'WON' : lost ? 'LOST' : 'TIED') : 'UPCOMING';

                  /* innings for this team */
                  const ourInn  = isTeamA ? m.innings1 : m.innings2;
                  const oppInn  = isTeamA ? m.innings2 : m.innings1;

                  return (
                    <div key={m._id} style={{ padding: '14px 20px', borderBottom: i < matches.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none', display: 'flex', alignItems: 'center', gap: 12 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: statusColor, padding: '2px 7px', borderRadius: 4, background: `${statusColor}18`, border: `1px solid ${statusColor}40`, letterSpacing: '0.08em' }}>{statusLabel}</span>
                          <p style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>vs {opponent}</p>
                        </div>
                        <p style={{ fontSize: 11, color: C.dim }}>{m.group} · {m.ground}</p>
                        {m.result?.description && <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{m.result.description}</p>}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {ourInn && <p style={{ fontSize: 14, fontWeight: 900, color: C.gold, fontFamily: 'var(--font-bebas)', lineHeight: 1 }}>{ourInn.runs}/{ourInn.wickets}</p>}
                        {oppInn && <p style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{oppInn.runs}/{oppInn.wickets}</p>}
                      </div>
                      <Link href={`/admin/matches/${m._id}/summary`} style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 7, background: C.goldDim, border: `1px solid rgba(201,162,39,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: C.gold, transition: 'all .15s' }}
                        title="View match summary"
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = C.goldDim; }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
