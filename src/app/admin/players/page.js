'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { PLAYER_ROLES } from '@/constants/cricket';

const C = {
  bg0: '#060e1a', bg1: '#0a1628', bg2: '#0f1e35',
  border: 'rgba(255,255,255,0.07)',
  gold: '#c9a227', green: '#22c55e', red: '#ef4444',
  text: '#e8e8e8', muted: '#8b9db7', dim: '#4a6a82',
};

const sel = {
  padding: '10px 14px', background: C.bg0,
  border: `1px solid ${C.border}`,
  borderRadius: 8, color: C.text, fontSize: 13,
  outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
  transition: 'border-color .15s',
};

export default function AdminPlayers() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [teams, setTeams]     = useState([]);
  const [players, setPlayers] = useState([]);
  const [maxPlayers, setMaxPlayers]   = useState(8);   // live value from DB
  const [maxInput, setMaxInput]       = useState('8'); // editable input string
  const [savingMax, setSavingMax]     = useState(false);

  const [form, setForm] = useState({ name: '', team: '', role: 'batsman', gender: 'male', isCaptain: false });
  const [msg, setMsg]   = useState({ text: '', type: 'ok' });
  const [deleteId, setDeleteId]       = useState(null);
  const [deleteTeamId, setDeleteTeamId] = useState(null);
  const [busy, setBusy]               = useState(false);
  const [importing, setImporting]     = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
    else if (!loading && user) load();
  }, [loading, user]);

  const load = async () => {
    const [t, p, s] = await Promise.all([
      api.get('/teams'),
      api.get('/players'),
      api.get('/settings'),
    ]);
    if (Array.isArray(t)) setTeams(t);
    if (Array.isArray(p)) setPlayers(p);
    if (s?.maxPlayersPerTeam) {
      setMaxPlayers(s.maxPlayersPerTeam);
      setMaxInput(String(s.maxPlayersPerTeam));
    }
  };

  const toast = (text, type = 'ok') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: 'ok' }), 3500);
  };

  /* ── Save max players setting ── */
  const handleSaveMax = async () => {
    const val = parseInt(maxInput, 10);
    if (isNaN(val) || val < 1 || val > 30) {
      toast('Enter a number between 1 and 30', 'err');
      return;
    }
    setSavingMax(true);
    const res = await api.put('/settings', { maxPlayersPerTeam: val });
    setSavingMax(false);
    if (res.maxPlayersPerTeam) {
      setMaxPlayers(res.maxPlayersPerTeam);
      setMaxInput(String(res.maxPlayersPerTeam));
      toast(`Max players per team updated to ${res.maxPlayersPerTeam}`);
    } else {
      toast(res.message || 'Failed to update setting', 'err');
    }
  };

  /* ── Add player ── */
  const handleAdd = async (e) => {
    e.preventDefault();
    setBusy(true);
    const res = await api.post('/players', form);
    setBusy(false);
    if (res._id) {
      toast(`${res.name} added`);
      setForm({ name: '', team: form.team, role: 'batsman', gender: 'male', isCaptain: false });
      load();
    } else toast(res.message || 'Failed to add player', 'err');
  };

  /* ── Delete player ── */
  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete(`/players/${deleteId}`);
    setDeleteId(null);
    load();
    toast('Player removed');
  };

  /* ── Delete team ── */
  const handleDeleteTeam = async () => {
    if (!deleteTeamId) return;
    await api.delete(`/teams/${deleteTeamId}`);
    setDeleteTeamId(null);
    load();
    toast('Team deleted');
  };

  /* ── CSV import ── */
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.postFormData('/players/import', fd);
    setImporting(false);
    toast(res.message || 'Import complete');
    load();
    e.target.value = '';
  };

  return (
    <AdminLayout>

      {/* ── Confirm delete player ── */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: C.bg1, border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '28px 32px', maxWidth: 360, width: '100%', margin: '0 16px' }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>Remove player?</p>
            <p style={{ fontSize: 13, color: C.dim, marginBottom: 24 }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', color: C.muted, border: `1px solid ${C.border}`, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '10px', borderRadius: 8, background: C.red, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete team ── */}
      {deleteTeamId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: C.bg1, border: '1px solid rgba(239,68,68,0.25)', borderRadius: 14, padding: '28px 32px', maxWidth: 360, width: '100%', margin: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: C.red }}>Delete Team?</p>
                <p style={{ fontSize: 12, color: C.dim, marginTop: 2 }}>All players will also be removed</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteTeamId(null)} style={{ flex: 1, padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', color: C.muted, border: `1px solid ${C.border}`, cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleDeleteTeam} style={{ flex: 1, padding: '10px', borderRadius: 8, background: C.red, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>Delete Team</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-page-pad">

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, letterSpacing: '-0.02em', marginBottom: 4 }}>Players</h1>
            <p style={{ fontSize: 13, color: C.dim }}>{players.length} players across {teams.length} teams · Max {maxPlayers} per team</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input type="file" id="csv-import" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
            <button suppressHydrationWarning onClick={() => document.getElementById('csv-import').click()} disabled={importing} style={{
              padding: '9px 18px', borderRadius: 8, border: `1px solid ${C.border}`,
              background: 'rgba(255,255,255,0.03)', color: importing ? C.dim : C.muted,
              cursor: importing ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'inherit',
            }}>
              {importing
                ? <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: C.gold, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>}
              {importing ? 'Importing…' : 'Import CSV'}
            </button>
          </div>
        </div>

        {/* ── Toast ── */}
        {msg.text && (
          <div style={{
            padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13, fontWeight: 500,
            background: msg.type === 'err' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.07)',
            color: msg.type === 'err' ? C.red : C.green,
            border: `1px solid ${msg.type === 'err' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
          }}>{msg.text}</div>
        )}

        {/* ── Settings: Max Players Per Team ── */}
        <div style={{ background: C.bg1, border: `1px solid rgba(201,162,39,0.2)`, borderRadius: 12, padding: '18px 24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>Tournament Setting</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>Max Players Per Team</p>
              <p style={{ fontSize: 12, color: C.dim }}>Controls how many players can be added to each team. Currently <strong style={{ color: C.gold }}>{maxPlayers}</strong>.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="number"
                min={1}
                max={30}
                value={maxInput}
                onChange={e => setMaxInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveMax()}
                style={{
                  ...sel,
                  width: 80, textAlign: 'center', fontWeight: 800, fontSize: 18,
                  fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em',
                  color: C.gold, cursor: 'text',
                  borderColor: maxInput !== String(maxPlayers) ? 'rgba(201,162,39,0.5)' : C.border,
                }}
              />
              <button
                onClick={handleSaveMax}
                disabled={savingMax || maxInput === String(maxPlayers)}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: 'none',
                  background: (savingMax || maxInput === String(maxPlayers))
                    ? 'rgba(201,162,39,0.3)'
                    : `linear-gradient(135deg,#d4a82a,${C.gold})`,
                  color: C.bg0, fontWeight: 800, fontSize: 13, fontFamily: 'inherit',
                  cursor: (savingMax || maxInput === String(maxPlayers)) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7,
                  whiteSpace: 'nowrap',
                }}
              >
                {savingMax && <div style={{ width: 13, height: 13, border: '2px solid rgba(6,14,26,0.25)', borderTopColor: C.bg0, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />}
                {savingMax ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Add player ── */}
        <div suppressHydrationWarning style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', marginBottom: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>Add Player</p>
          <form onSubmit={handleAdd} suppressHydrationWarning style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input suppressHydrationWarning required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Full name" style={{ ...sel, flex: '1 1 140px', minWidth: 0, cursor: 'text' }}
              onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.35)'}
              onBlur={e => e.target.style.borderColor = C.border} />
            <select suppressHydrationWarning required value={form.team} onChange={e => setForm({ ...form, team: e.target.value })} style={{ ...sel, flex: '1 1 140px', minWidth: 0 }}>
              <option value="">Select team</option>
              {teams.map(t => {
                const cnt = players.filter(p => p.team?._id === t._id || p.team === t._id).length;
                const full = cnt >= maxPlayers;
                return <option key={t._id} value={t._id} disabled={full}>{t.name} — {cnt}/{maxPlayers}{full ? ' (full)' : ''}</option>;
              })}
            </select>
            <select suppressHydrationWarning value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ ...sel, flex: '1 1 100px', minWidth: 0 }}>
              {PLAYER_ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
            <select suppressHydrationWarning value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} style={{ ...sel, flex: '1 1 80px', minWidth: 0 }}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.muted, fontSize: 13, cursor: 'pointer', padding: '0 2px', whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={form.isCaptain} onChange={e => setForm({ ...form, isCaptain: e.target.checked })} style={{ accentColor: C.gold, width: 14, height: 14 }} />
              Captain
            </label>
            <button suppressHydrationWarning type="submit" disabled={busy} style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: busy ? 'rgba(201,162,39,0.4)' : `linear-gradient(135deg,#d4a82a,${C.gold})`,
              color: C.bg0, fontWeight: 800, fontSize: 13, fontFamily: 'inherit',
              cursor: busy ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              {busy && <div style={{ width: 13, height: 13, border: '2px solid rgba(6,14,26,0.25)', borderTopColor: C.bg0, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />}
              {busy ? 'Adding…' : 'Add Player'}
            </button>
          </form>
        </div>

        {/* ── Teams grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="admin-grid-2">
          {teams.map(team => {
            const tp   = players.filter(p => p.team?._id === team._id || p.team === team._id);
            const full = tp.length >= maxPlayers;
            return (
              <div key={team._id} style={{ background: C.bg1, border: `1px solid ${full ? 'rgba(34,197,94,0.15)' : C.border}`, borderRadius: 12, overflow: 'hidden' }}>

                {/* Team header */}
                <div style={{ padding: '14px 20px', borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: C.gold, fontFamily: 'var(--font-bebas)' }}>{team.group}</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{team.name}</p>
                      <p style={{ fontSize: 11, color: C.dim, marginTop: 1 }}>Group {team.group}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                      background: full ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                      color: full ? C.green : C.muted,
                      border: `1px solid ${full ? 'rgba(34,197,94,0.2)' : C.border}`,
                    }}>{tp.length} / {maxPlayers}</span>
                    <button onClick={() => setDeleteTeamId(team._id)} style={{
                      width: 30, height: 30, borderRadius: 7, border: 'none', cursor: 'pointer',
                      background: 'transparent', color: C.dim,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = C.red; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.dim; }}
                      title="Delete team"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                    </button>
                  </div>
                </div>

                {/* Player table */}
                {tp.length === 0 ? (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: C.dim, fontSize: 13 }}>No players added yet</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {['#', 'Name', 'Role', ''].map((h, i) => (
                          <th key={i} style={{ padding: '9px 16px', textAlign: i === 3 ? 'right' : 'left', fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tp.map((p, i) => (
                        <tr key={p._id} style={{ borderBottom: i < tp.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background .15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '11px 16px', fontSize: 12, color: C.dim, fontWeight: 600, width: 36 }}>{i + 1}</td>
                          <td style={{ padding: '11px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              {p.isCaptain && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill={C.gold} stroke="none" style={{ flexShrink: 0 }}>
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              )}
                              <span style={{ fontSize: 13, fontWeight: p.isCaptain ? 700 : 500, color: p.isCaptain ? C.gold : C.text }}>{p.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '11px 16px' }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'capitalize' }}>{p.role}</span>
                            <span style={{ fontSize: 10, color: C.dim, marginLeft: 8 }}>{p.gender === 'female' ? '♀' : '♂'}</span>
                          </td>
                          <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                            <button onClick={() => setDeleteId(p._id)} style={{
                              width: 28, height: 28, borderRadius: 7, border: 'none', cursor: 'pointer',
                              background: 'transparent', color: C.dim,
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all .15s',
                            }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = C.red; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.dim; }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
