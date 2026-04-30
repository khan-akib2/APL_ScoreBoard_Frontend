'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const AWARD_META = {
  winner:            { label: 'Tournament Winner',       icon: '🏆', sub: 'Team captain of the winning team'         },
  runnerUp:          { label: 'Runner Up',               icon: '🥈', sub: 'Team captain of the runner-up team'       },
  bestBatsmanMale:   { label: 'Best Batsman (Male)',     icon: '🏏', sub: 'Most runs scored by a male player'        },
  bestBatsmanFemale: { label: 'Best Batsman (Female)',   icon: '🏏', sub: 'Most runs scored by a female player'      },
  bestBowlerMale:    { label: 'Best Bowler (Male)',      icon: '⚡', sub: 'Most wickets taken by a male player'      },
  bestBowlerFemale:  { label: 'Best Bowler (Female)',    icon: '⚡', sub: 'Most wickets taken by a female player'    },
  manOfSeries:       { label: 'Man of the Series',       icon: '⭐', sub: 'Best overall male performer'              },
  womanOfSeries:     { label: 'Woman of the Series',     icon: '⭐', sub: 'Best overall female performer'            },
  mostSixes:         { label: 'Most Sixes',              icon: '6️⃣', sub: 'Most sixes hit in the tournament'         },
  mostFours:         { label: 'Most Fours',              icon: '4️⃣', sub: 'Most fours hit in the tournament'         },
  bestFielder:       { label: 'Best Fielder',            icon: '🧤', sub: 'Most catches taken in the tournament'     },
};

const AWARD_KEYS = Object.keys(AWARD_META);

const C = {
  bg0:'#060e1a', bg1:'#0a1628', bg2:'#0f1e35',
  border:'rgba(255,255,255,0.07)',
  gold:'#c9a227', goldDim:'rgba(201,162,39,0.1)',
  red:'#ef4444', green:'#22c55e',
  text:'#e8e8e8', muted:'#8b9db7', dim:'#4a6a82',
};

export default function AdminAwards() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [awards, setAwards]     = useState(null);
  const [computing, setComputing] = useState(false);
  const [toggling, setToggling]   = useState('');
  const [toast, setToast]         = useState({ text: '', type: 'ok' });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
    else if (!loading && user) load();
  }, [loading, user]);

  const load = async () => {
    const data = await api.get('/awards/admin');
    setAwards(data);
  };

  const showToast = (text, type = 'ok') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: 'ok' }), 3000);
  };

  const compute = async () => {
    setComputing(true);
    const data = await api.post('/awards/compute', {});
    setComputing(false);
    if (data._id || data.lastComputed) { setAwards(data); showToast('Awards recomputed from match data'); }
    else showToast(data.message || 'Error computing awards', 'err');
  };

  const togglePublish = async (key, current) => {
    setToggling(key);
    const data = await api.put(`/awards/publish/${key}`, { published: !current });
    setToggling('');
    if (data._id || data.lastComputed) { setAwards(data); showToast(!current ? `"${AWARD_META[key].label}" is now visible to audience` : `"${AWARD_META[key].label}" hidden from audience`); }
    else showToast('Error updating', 'err');
  };

  const publishAll = async (pub) => {
    const data = await api.put('/awards/publish-all', { published: pub });
    if (data._id || data.lastComputed) { setAwards(data); showToast(pub ? 'All awards published to audience' : 'All awards hidden from audience'); }
  };

  const publishedCount = awards ? AWARD_KEYS.filter(k => awards[k]?.published).length : 0;

  return (
    <AdminLayout>
      <div className="admin-page-pad">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>Tournament</p>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, letterSpacing: '-0.02em', marginBottom: 4 }}>Awards</h1>
            <p style={{ fontSize: 13, color: C.dim }}>Auto-calculated from match data · Control audience visibility per award</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => publishAll(false)} style={{ padding: '9px 16px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.04)', color: C.muted, cursor: 'pointer', fontWeight: 600, fontSize: 12, fontFamily: 'inherit' }}>
              Hide All
            </button>
            <button onClick={() => publishAll(true)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)', color: C.green, cursor: 'pointer', fontWeight: 700, fontSize: 12, fontFamily: 'inherit' }}>
              Publish All
            </button>
            <button onClick={compute} disabled={computing} style={{
              padding: '9px 20px', borderRadius: 8, border: 'none', cursor: computing ? 'not-allowed' : 'pointer',
              background: computing ? 'rgba(201,162,39,0.4)' : `linear-gradient(135deg,#d4a82a,${C.gold})`,
              color: C.bg0, fontWeight: 800, fontSize: 13, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              {computing && <div style={{ width: 13, height: 13, border: '2px solid rgba(6,14,26,0.25)', borderTopColor: C.bg0, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />}
              {computing ? 'Computing…' : 'Recompute Awards'}
            </button>
          </div>
        </div>

        {/* Toast */}
        {toast.text && (
          <div style={{
            padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13, fontWeight: 500,
            background: toast.type === 'err' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.07)',
            color: toast.type === 'err' ? C.red : C.green,
            border: `1px solid ${toast.type === 'err' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
          }}>{toast.text}</div>
        )}

        {/* Status bar */}
        {awards?.lastComputed && (
          <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 20, background: C.bg1, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: C.dim }}>
            <span>Last computed: <strong style={{ color: C.muted }}>{new Date(awards.lastComputed).toLocaleString()}</strong></span>
            <span><strong style={{ color: publishedCount > 0 ? C.green : C.dim }}>{publishedCount}</strong> of {AWARD_KEYS.length} awards visible to audience</span>
          </div>
        )}

        {/* No data state */}
        {!awards?.lastComputed && (
          <div style={{ padding: '48px 24px', textAlign: 'center', background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: C.muted, marginBottom: 8 }}>No awards computed yet</p>
            <p style={{ fontSize: 13, color: C.dim, marginBottom: 20 }}>Click "Recompute Awards" to calculate from completed match data</p>
            <button onClick={compute} disabled={computing} style={{ padding: '10px 24px', borderRadius: 9, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,#d4a82a,${C.gold})`, color: C.bg0, fontWeight: 800, fontSize: 13, fontFamily: 'inherit' }}>
              Compute Now
            </button>
          </div>
        )}

        {/* Awards grid */}
        {awards?.lastComputed && (
          <div className="awards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {AWARD_KEYS.map(key => {
              const meta    = AWARD_META[key];
              const award   = awards[key];
              const pub     = award?.published || false;
              const hasData = award?.player;
              const isToggling = toggling === key;

              return (
                <div key={key} style={{
                  background: C.bg1,
                  border: `1px solid ${pub ? 'rgba(34,197,94,0.2)' : C.border}`,
                  borderRadius: 12, overflow: 'hidden',
                  transition: 'border-color .2s',
                }}>
                  {/* Card header */}
                  <div style={{
                    padding: '14px 18px',
                    background: pub ? 'rgba(34,197,94,0.04)' : C.bg2,
                    borderBottom: `1px solid ${pub ? 'rgba(34,197,94,0.12)' : C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{meta.icon}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{meta.label}</p>
                        <p style={{ fontSize: 11, color: C.dim, marginTop: 1 }}>{meta.sub}</p>
                      </div>
                    </div>
                    {/* Publish toggle */}
                    <button onClick={() => togglePublish(key, pub)} disabled={isToggling || !hasData} style={{
                      padding: '6px 14px', borderRadius: 7, border: 'none', cursor: (isToggling || !hasData) ? 'not-allowed' : 'pointer',
                      background: pub ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                      color: pub ? C.green : C.dim,
                      fontWeight: 700, fontSize: 11, fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', gap: 5,
                      outline: `1px solid ${pub ? 'rgba(34,197,94,0.25)' : C.border}`,
                      opacity: !hasData ? 0.4 : 1,
                      transition: 'all .2s',
                    }}>
                      {isToggling ? (
                        <div style={{ width: 11, height: 11, border: `2px solid ${pub ? C.green : C.dim}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                      ) : (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          {pub ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></> : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>}
                        </svg>
                      )}
                      {pub ? 'Visible' : 'Hidden'}
                    </button>
                  </div>

                  {/* Award data */}
                  <div style={{ padding: '16px 18px' }}>
                    {hasData ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Avatar */}
                        <div style={{
                          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                          background: pub ? 'rgba(34,197,94,0.1)' : C.goldDim,
                          border: `1px solid ${pub ? 'rgba(34,197,94,0.25)' : 'rgba(201,162,39,0.2)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 18, fontWeight: 900, color: pub ? C.green : C.gold,
                          fontFamily: 'var(--font-bebas)',
                        }}>
                          {award.player?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: 800, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {award.player?.name || 'Unknown'}
                          </p>
                          <p style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>
                            {award.teamName}
                            {award.runs    !== undefined && <span style={{ color: C.gold, marginLeft: 8, fontWeight: 700 }}>{award.runs} runs</span>}
                            {award.wickets !== undefined && <span style={{ color: C.gold, marginLeft: 8, fontWeight: 700 }}>{award.wickets} wickets</span>}
                            {award.sixes   !== undefined && <span style={{ color: C.gold, marginLeft: 8, fontWeight: 700 }}>{award.sixes} sixes</span>}
                            {award.fours   !== undefined && <span style={{ color: C.gold, marginLeft: 8, fontWeight: 700 }}>{award.fours} fours</span>}
                            {award.catches !== undefined && <span style={{ color: C.gold, marginLeft: 8, fontWeight: 700 }}>{award.catches} catches</span>}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{
                            fontSize: 9, fontWeight: 800, letterSpacing: '0.1em',
                            color: pub ? C.green : C.dim,
                            padding: '3px 8px', borderRadius: 4,
                            background: pub ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${pub ? 'rgba(34,197,94,0.2)' : C.border}`,
                          }}>
                            {pub ? 'PUBLISHED' : 'ADMIN ONLY'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.dim} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <p style={{ fontSize: 12, color: C.dim }}>No data — recompute after matches complete</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
