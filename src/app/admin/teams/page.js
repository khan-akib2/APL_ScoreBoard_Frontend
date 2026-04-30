'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const C = {
  bg0: '#060e1a', bg1: '#0a1628', bg2: '#0f1e35',
  border: 'rgba(255,255,255,0.07)',
  gold: '#c9a227', goldDim: 'rgba(201,162,39,0.12)',
  red: '#ef4444', redDim: 'rgba(239,68,68,0.1)',
  green: '#22c55e',
  text: '#e8e8e8', muted: '#8b9db7', dim: '#4a6a82',
};

export default function AdminTeams() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [teams, setTeams]           = useState([]);
  const [form, setForm]             = useState({ name: '', group: 'A', captainName: '', captainEmail: '' });
  const [msg, setMsg]               = useState({ text: '', type: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
    else if (!loading && user) loadTeams();
  }, [loading, user]);

  const loadTeams = () => api.get('/teams').then(d => { if (Array.isArray(d)) setTeams(d); });

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: 'success' }), 3000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await api.post('/teams', form);
    setSubmitting(false);
    if (res._id) { showMsg(`${res.name} added to Group ${res.group}`); setForm({ name: '', group: form.group, captainName: '', captainEmail: '' }); loadTeams(); }
    else showMsg(res.message || 'Error adding team', 'error');
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await api.delete(`/teams/${deleteConfirm}`);
    setDeleteConfirm(null);
    loadTeams();
    showMsg('Team deleted');
  };

  const groupA = teams.filter(t => t.group === 'A');
  const groupB = teams.filter(t => t.group === 'B');

  return (
    <AdminLayout>
      {/* ── Delete modal ── */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: C.bg1, border: `1px solid ${C.redDim}`, borderRadius: 16, padding: 28, maxWidth: 380, width: '100%', margin: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.redDim, border: `1px solid rgba(239,68,68,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: C.red }}>Delete Team?</p>
                <p style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>All players will also be removed</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '10px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', color: C.muted, border: `1px solid ${C.border}`, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '10px', borderRadius: 9, background: C.red, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>Delete Team</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-page-pad">

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>Tournament Management</p>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: '-0.02em', marginBottom: 4 }}>Manage Teams</h1>
            <p style={{ fontSize: 13, color: C.dim }}>Add and manage teams across Group A and Group B</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[{ g: 'A', count: groupA.length }, { g: 'B', count: groupB.length }].map(({ g, count }) => (
              <div key={g} style={{ padding: '10px 18px', borderRadius: 10, background: C.bg2, border: `1px solid ${C.border}`, textAlign: 'center' }}>
                <p style={{ fontSize: 20, fontWeight: 900, color: C.gold, fontFamily: 'var(--font-bebas)', lineHeight: 1 }}>{count}/4</p>
                <p style={{ fontSize: 10, color: C.dim, fontWeight: 700, letterSpacing: '0.1em', marginTop: 2 }}>GROUP {g}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Toast ── */}
        {msg.text && (
          <div style={{
            padding: '11px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8,
            background: msg.type === 'error' ? C.redDim : 'rgba(34,197,94,0.08)',
            color: msg.type === 'error' ? C.red : C.green,
            border: `1px solid ${msg.type === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {msg.type === 'error'
                ? <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                : <><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></>}
            </svg>
            {msg.text}
          </div>
        )}

        {/* ── Add team form ── */}
        <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, padding: '22px 24px', marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Add New Team</p>
          <form onSubmit={handleAdd} suppressHydrationWarning style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'stretch' }}>
            <input
              suppressHydrationWarning
              required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Enter team name..."
              style={{
                flex: '1 1 160px', minWidth: 0, padding: '11px 16px',
                background: C.bg0, border: `1px solid ${C.border}`,
                borderRadius: 9, color: C.text, fontSize: 14, outline: 'none',
                fontFamily: 'inherit', transition: 'border-color .2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.4)'}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <input
              suppressHydrationWarning
              value={form.captainName || ''}
              onChange={e => setForm({ ...form, captainName: e.target.value })}
              placeholder="Captain name"
              style={{
                flex: '1 1 140px', minWidth: 0, padding: '11px 16px',
                background: C.bg0, border: `1px solid ${C.border}`,
                borderRadius: 9, color: C.text, fontSize: 14, outline: 'none',
                fontFamily: 'inherit', transition: 'border-color .2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.4)'}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <input
              suppressHydrationWarning
              type="email"
              value={form.captainEmail || ''}
              onChange={e => setForm({ ...form, captainEmail: e.target.value })}
              placeholder="Captain email (for winner notification)"
              style={{
                flex: '2 1 200px', minWidth: 0, padding: '11px 16px',
                background: C.bg0, border: `1px solid ${C.border}`,
                borderRadius: 9, color: C.text, fontSize: 14, outline: 'none',
                fontFamily: 'inherit', transition: 'border-color .2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.4)'}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <select
              suppressHydrationWarning
              value={form.group}
              onChange={e => setForm({ ...form, group: e.target.value })}
              style={{
                padding: '11px 16px', background: C.bg0, border: `1px solid ${C.border}`,
                borderRadius: 9, color: C.text, fontSize: 14, cursor: 'pointer',
                outline: 'none', fontFamily: 'inherit', flex: '0 0 auto',
              }}
            >
              <option value="A">Group A</option>
              <option value="B">Group B</option>
            </select>
            <button suppressHydrationWarning type="submit" disabled={submitting} style={{
              padding: '11px 28px', borderRadius: 9, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
              background: submitting ? 'rgba(201,162,39,0.5)' : `linear-gradient(135deg,#d4a82a,${C.gold})`,
              color: C.bg0, fontWeight: 800, fontSize: 13, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: submitting ? 'none' : '0 4px 16px rgba(201,162,39,0.2)',
              transition: 'all .2s',
            }}>
              {submitting ? (
                <div style={{ width: 14, height: 14, border: '2px solid rgba(6,14,26,0.3)', borderTopColor: C.bg0, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              )}
              {submitting ? 'Adding...' : 'Add Team'}
            </button>
          </form>
        </div>

        {/* ── Groups grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="admin-grid-2">
          {['A', 'B'].map(g => {
            const grp = g === 'A' ? groupA : groupB;
            const full = grp.length >= 4;
            return (
              <div key={g} style={{ background: C.bg1, border: `1px solid ${full ? 'rgba(34,197,94,0.2)' : C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                {/* Group header */}
                <div style={{
                  padding: '16px 20px',
                  background: full ? 'rgba(34,197,94,0.05)' : C.bg2,
                  borderBottom: `1px solid ${full ? 'rgba(34,197,94,0.15)' : C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: full ? 'rgba(34,197,94,0.15)' : C.goldDim,
                      border: `1px solid ${full ? 'rgba(34,197,94,0.3)' : 'rgba(201,162,39,0.25)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 900,
                      color: full ? C.green : C.gold,
                      fontFamily: 'var(--font-bebas)',
                    }}>{g}</div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Group {g}</p>
                      <p style={{ fontSize: 11, color: C.dim, marginTop: 1 }}>Round Robin · {grp.length} of 4 teams</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Progress dots */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[0,1,2,3].map(i => (
                        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < grp.length ? (full ? C.green : C.gold) : C.border, transition: 'background .3s' }} />
                      ))}
                    </div>
                    {full && (
                      <span style={{ fontSize: 9, fontWeight: 800, color: C.green, padding: '3px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', letterSpacing: '0.08em' }}>FULL</span>
                    )}
                  </div>
                </div>

                {/* Team list */}
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {grp.length === 0 ? (
                    <div style={{ padding: '28px 0', textAlign: 'center' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.dim} strokeWidth="1.5" style={{ margin: '0 auto 10px', display: 'block' }}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <p style={{ fontSize: 13, color: C.dim }}>No teams yet</p>
                      <p style={{ fontSize: 11, color: C.dim, marginTop: 4, opacity: 0.6 }}>Add a team to Group {g} above</p>
                    </div>
                  ) : grp.map((t, idx) => (
                    <div key={t._id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 10,
                      background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                      border: `1px solid ${C.border}`,
                      transition: 'border-color .2s, background .2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,162,39,0.2)'; e.currentTarget.style.background = C.goldDim; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'; }}
                    >
                      {/* Rank badge */}
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: C.bg0, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: C.dim, fontFamily: 'var(--font-bebas)', flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</p>
                        <p style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>
                          {t.players?.length || 0} player{t.players?.length !== 1 ? 's' : ''} · P:{t.stats?.played || 0} W:{t.stats?.won || 0} L:{t.stats?.lost || 0}
                          {t.captainEmail && <span style={{ color: 'rgba(201,162,39,0.6)', marginLeft: 6 }}>· ✉ {t.captainEmail}</span>}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 18, fontWeight: 900, color: C.gold, lineHeight: 1, fontFamily: 'var(--font-bebas)' }}>{t.stats?.points || 0}</p>
                          <p style={{ fontSize: 9, color: C.dim, fontWeight: 700, letterSpacing: '0.08em' }}>PTS</p>
                        </div>
                        <button onClick={() => setDeleteConfirm(t._id)} style={{
                          width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: 'transparent', color: C.dim, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all .2s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = C.redDim; e.currentTarget.style.color = C.red; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.dim; }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Group footer */}
                {grp.length > 0 && (
                  <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.border}`, background: C.bg0, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.dim }}>
                    <span>Total Points: <strong style={{ color: C.text }}>{grp.reduce((s, t) => s + (t.stats?.points || 0), 0)}</strong></span>
                    <span>Matches Played: <strong style={{ color: C.text }}>{grp.reduce((s, t) => s + (t.stats?.played || 0), 0) / 2 | 0}</strong></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
