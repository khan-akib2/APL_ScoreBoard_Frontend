'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { PLAYER_ROLES } from '@/constants/cricket';

export default function AdminPlayers() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({ name: '', team: '', role: 'batsman', isCaptain: false });
  const [msg, setMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
    else { api.get('/teams').then((d) => { if (Array.isArray(d)) setTeams(d); }); loadPlayers(); }
  }, [loading, user]);

  const loadPlayers = () => api.get('/players').then((d) => { if (Array.isArray(d)) setPlayers(d); });

  const handleAdd = async (e) => {
    e.preventDefault();
    // Warn if team already has a captain and we're adding another
    if (form.isCaptain) {
      const teamPlayers = players.filter(p => p.team?._id === form.team || p.team === form.team);
      const existingCaptain = teamPlayers.find(p => p.isCaptain);
      if (existingCaptain) {
        setMsg(`${existingCaptain.name} was captain — replaced as captain.`);
      }
    }
    const res = await api.post('/players', form);
    if (res._id) {
      setMsg(form.isCaptain ? `Player added as captain!` : 'Player added!');
      setForm({ name: '', team: form.team, role: 'batsman', isCaptain: false });
      loadPlayers();
    } else {
      setMsg(res.message || 'Error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await api.delete(`/players/${deleteConfirm}`);
    setDeleteConfirm(null);
    loadPlayers();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setMsg('Importing...');
    const res = await api.postFormData('/players/import', formData);
    setMsg(res.message || 'Import completed');
    loadPlayers();
    e.target.value = '';
  };

  return (
    <AdminLayout>
      {/* Delete modal */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ padding: '28px', maxWidth: '380px', width: '100%', margin: '0 16px', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p style={{ color: 'var(--red)', fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>Delete Player?</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline" style={{ flex: 1, padding: '10px', fontSize: '13px' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '26px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>Manage Players</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Add and manage players for each team</p>
          </div>
          <div>
            <input type="file" id="csv-import" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
            <button onClick={() => document.getElementById('csv-import').click()} className="btn-outline"
              style={{ padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              Import CSV
            </button>
          </div>
        </div>

        {/* Add form */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Add Player</p>
          {msg && (
            <div style={{ padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', background: 'rgba(201, 162, 39, 0.04)', border: '1px solid var(--border-default)', color: 'var(--gold)', fontSize: '13px' }}>{msg}</div>
          )}
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Player name" className="input-field" style={{ flex: 1, minWidth: '180px' }} />
            <select required value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })}
              className="input-field" style={{ minWidth: '160px', width: 'auto', cursor: 'pointer' }}>
              <option value="">Select Team</option>
              {teams.map((t) => <option key={t._id} value={t._id}>{t.name} (Grp {t.group})</option>)}
            </select>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="input-field" style={{ width: 'auto', cursor: 'pointer' }}>
            {PLAYER_ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isCaptain} onChange={(e) => setForm({ ...form, isCaptain: e.target.checked })} style={{ accentColor: 'var(--gold)' }} />
              Captain
            </label>
            <button type="submit" className="btn-gold" style={{ padding: '13px 28px', fontSize: '13px' }}>Add Player</button>
          </form>
        </div>

        {/* Teams */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {teams.map((team) => {
            const tp = players.filter((p) => p.team?._id === team._id || p.team === team._id);
            return (
              <div key={team._id} className="card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: 'var(--bg-primary)' }}>{team.group}</div>
                    <p style={{ color: 'var(--gold)', fontSize: '14px', fontWeight: 700 }}>{team.name}</p>
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '5px 12px', borderRadius: '6px',
                    background: tp.length >= 7 ? 'rgba(34, 197, 94, 0.06)' : 'rgba(139, 157, 183, 0.04)',
                    color: tp.length >= 7 ? 'var(--green)' : 'var(--text-secondary)',
                    border: `1px solid ${tp.length >= 7 ? 'rgba(34, 197, 94, 0.12)' : 'var(--border-subtle)'}`,
                  }}>{tp.length}/7</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                  {tp.map((p) => (
                    <div key={p._id} style={{
                      background: p.isCaptain ? 'rgba(201, 162, 39, 0.04)' : 'var(--bg-secondary)',
                      border: `1px solid ${p.isCaptain ? 'var(--border-strong)' : 'var(--border-subtle)'}`,
                      borderRadius: '10px', padding: '13px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'border-color 0.2s',
                    }}>
                      <div>
                        <p style={{ color: p.isCaptain ? 'var(--gold)' : 'var(--text-primary)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {p.name} {p.isCaptain && '👑'}
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '3px' }}>{p.role.charAt(0).toUpperCase() + p.role.slice(1)}</p>
                      </div>
                      <button onClick={() => setDeleteConfirm(p._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: '14px', padding: '4px', borderRadius: '4px', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>✕</button>
                    </div>
                  ))}
                  {tp.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: '12px', gridColumn: '1/-1', padding: '8px 0' }}>No players yet</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
