'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

export default function AdminTeams() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({ name: '', group: 'A' });
  const [msg, setMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
    else loadTeams();
  }, [loading, user]);

  const loadTeams = () => api.get('/teams').then((d) => { if (Array.isArray(d)) setTeams(d); });

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await api.post('/teams', form);
    if (res._id) { setMsg('Team added!'); setForm({ name: '', group: form.group }); loadTeams(); }
    else setMsg(res.message || 'Error');
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await api.delete(`/teams/${deleteConfirm}`);
    setDeleteConfirm(null);
    loadTeams();
  };

  const groupA = teams.filter((t) => t.group === 'A');
  const groupB = teams.filter((t) => t.group === 'B');

  return (
    <AdminLayout>
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ padding: '28px', maxWidth: '380px', width: '100%', margin: '0 16px', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p style={{ color: 'var(--red)', fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>Delete Team?</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>This will also remove all players. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline" style={{ flex: 1, padding: '10px', fontSize: '13px' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 md:p-8">
        <h1 style={{ color: 'var(--text-primary)', fontSize: '26px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>Manage Teams</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Add and manage teams across groups</p>

        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Add Team</p>
          {msg && <div style={{ padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', background: 'rgba(201, 162, 39, 0.04)', border: '1px solid var(--border-default)', color: 'var(--gold)', fontSize: '13px' }}>{msg}</div>}
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Team name" className="input-field" style={{ flex: 1, minWidth: '180px' }} />
            <select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} className="input-field" style={{ width: 'auto', cursor: 'pointer' }}>
              <option value="A">Group A</option>
              <option value="B">Group B</option>
            </select>
            <button type="submit" className="btn-gold" style={{ padding: '13px 28px', fontSize: '13px' }}>Add Team</button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {['A', 'B'].map((g) => {
            const grp = g === 'A' ? groupA : groupB;
            return (
              <div key={g} className="card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: 'var(--bg-primary)' }}>{g}</div>
                    <p style={{ color: 'var(--gold)', fontSize: '14px', fontWeight: 700 }}>Group {g}</p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{grp.length}/4</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {grp.map((t) => (
                    <div key={t._id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '13px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.15s' }}>
                      <div>
                        <p style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>{t.name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>{t.players?.length || 0}/7 players</p>
                      </div>
                      <button onClick={() => setDeleteConfirm(t._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: '12px', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}>Delete</button>
                    </div>
                  ))}
                  {grp.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: '12px', padding: '8px 0' }}>No teams yet</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
