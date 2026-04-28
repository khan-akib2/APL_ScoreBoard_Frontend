'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

export default function AdminMatches() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    teamA: '',
    teamB: '',
    stage: 'group',
    group: 'A',
    ground: 'Ground 1',
    overs: 5,
    date: '',
    round: 1,
  });
  const [msg, setMsg] = useState('');
  const [editingMatch, setEditingMatch] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [tossModal, setTossModal] = useState(null);
  const [tossForm, setTossForm] = useState({ tossWinner: '', tossDecision: 'bat' });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
    else { loadMatches(); loadTeams(); }
  }, [loading, user]);

  const loadTeams = () => api.get('/teams').then((d) => { if (Array.isArray(d)) setTeams(d); });

  const loadMatches = () => api.get('/matches').then((d) => { if (Array.isArray(d)) setMatches(d); });

  const setStatus = async (id, status) => {
    await api.put(`/matches/${id}`, { status });
    loadMatches();
  };

  const handleDelete = async (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    await api.delete(`/matches/${deleteConfirm}`);
    setMsg('Match deleted successfully!');
    setDeleteConfirm(null);
    loadMatches();
    setTimeout(() => setMsg(''), 3000);
  };

  const handleTossSetup = (match) => {
    setTossModal(match);
    setTossForm({
      tossWinner: match.tossWinner?._id || match.tossWinner || '',
      tossDecision: match.tossDecision || 'bat'
    });
  };

  const saveToss = async (e) => {
    e.preventDefault();
    if (!tossModal || !tossForm.tossWinner) return;
    
    await api.put(`/matches/${tossModal._id}`, {
      tossWinner: tossForm.tossWinner,
      tossDecision: tossForm.tossDecision
    });
    
    setMsg('Toss details saved successfully!');
    setTossModal(null);
    setTossForm({ tossWinner: '', tossDecision: 'bat' });
    loadMatches();
    setTimeout(() => setMsg(''), 3000);
  };

  const handleEdit = (match) => {
    setEditingMatch(match);
    setForm({
      teamA: match.teamA?._id || match.teamA,
      teamB: match.teamB?._id || match.teamB,
      stage: match.stage,
      group: match.group,
      ground: match.ground,
      overs: match.overs,
      date: match.date ? new Date(match.date).toISOString().split('T')[0] : '',
      round: match.round || 1,
    });
    setShowCreateForm(true);
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    setMsg('');
    if (form.teamA === form.teamB) {
      setMsg('Please select different teams');
      return;
    }
    
    const matchData = {
      teamA: form.teamA,
      teamB: form.teamB,
      stage: form.stage,
      group: form.group,
      ground: form.ground,
      overs: form.overs,
      date: form.date || new Date(),
      status: editingMatch ? editingMatch.status : 'scheduled'
    };
    
    // Add round only for group stage matches
    if (form.stage === 'group') {
      matchData.round = form.round;
    }
    
    let res;
    if (editingMatch) {
      res = await api.put(`/matches/${editingMatch._id}`, matchData);
      setMsg('Match updated successfully!');
    } else {
      res = await api.post('/matches', matchData);
      setMsg('Match created successfully!');
    }
    
    if (res._id || res.message !== 'Error') {
      setForm({
        teamA: '',
        teamB: '',
        stage: 'group',
        group: 'A',
        ground: 'Ground 1',
        overs: 5,
        date: '',
        round: 1,
      });
      setShowCreateForm(false);
      setEditingMatch(null);
      loadMatches();
      setTimeout(() => setMsg(''), 3000);
    } else {
      setMsg(res.message || 'Error saving match');
    }
  };

  const statusColor = { 
    live: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }, 
    scheduled: { color: '#8aacbf', bg: 'rgba(161, 189, 203, 0.1)' }, 
    completed: { color: 'rgba(255,255,255,0.1)', bg: 'rgba(26, 42, 74, 0.1)' } 
  };

  // Group matches by stage
  const groupAMatches = matches.filter(m => m.group === 'A');
  const groupBMatches = matches.filter(m => m.group === 'B');
  const semiMatches = matches.filter(m => m.stage === 'semi');
  const finalMatches = matches.filter(m => m.stage === 'final');

  const MatchCard = ({ m }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3" style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '14px 16px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: '#ffffff', fontSize: '13px', fontWeight: 600 }}>{m.teamA?.name} vs {m.teamB?.name}</p>
        <p style={{ color: '#4a6a82', fontSize: '11px', marginTop: '2px' }}>{m.ground} • Round {m.round || '-'} • {m.overs} overs</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'capitalize', padding: '3px 8px', borderRadius: '4px',
          color: m.status === 'live' ? '#ef4444' : m.status === 'completed' ? '#4a6a82' : '#8aacbf',
          background: m.status === 'live' ? 'rgba(239,68,68,0.1)' : m.status === 'completed' ? 'rgba(74,106,130,0.1)' : 'rgba(138,172,191,0.1)' }}>
          {m.status}
        </span>
        {m.status === 'scheduled' && (
          <>
            <button onClick={() => handleTossSetup(m)} style={{ padding: '5px 10px', borderRadius: '5px', background: 'rgba(201,162,39,0.2)', color: '#c9a227', border: '1px solid rgba(201,162,39,0.3)', cursor: 'pointer', fontWeight: 600, fontSize: '11px' }}>
              {m.tossWinner ? '✓ Toss Set' : 'Set Toss'}
            </button>
            <button onClick={() => setStatus(m._id, 'live')} style={{ padding: '5px 10px', borderRadius: '5px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '11px' }}>Start Live</button>
            <button onClick={() => handleEdit(m)} style={{ padding: '5px 10px', borderRadius: '5px', background: 'rgba(255,255,255,0.1)', color: '#8aacbf', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '11px' }}>Edit</button>
          </>
        )}
        {m.status === 'live' && (
          <Link href={`/admin/matches/${m._id}/score`} style={{ padding: '5px 10px', borderRadius: '5px', background: '#c9a227', color: '#0a1628', textDecoration: 'none', fontWeight: 600, fontSize: '11px' }}>Update Score</Link>
        )}
        {m.status !== 'completed' && (
          <Link href={`/admin/matches/${m._id}/complete`} style={{ padding: '5px 10px', borderRadius: '5px', background: 'rgba(255,255,255,0.1)', color: '#8aacbf', textDecoration: 'none', fontWeight: 600, fontSize: '11px' }}>Complete</Link>
        )}
        {m.status !== 'scheduled' && (
          <button onClick={() => setStatus(m._id, 'scheduled')} style={{ padding: '5px 10px', borderRadius: '5px', background: 'rgba(255,255,255,0.1)', color: '#8aacbf', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '11px' }}>Reset</button>
        )}
        <button onClick={() => handleDelete(m._id)} style={{ padding: '5px 10px', borderRadius: '5px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontWeight: 600, fontSize: '11px' }}>Delete</button>
      </div>
    </div>
  );

  const StageSection = ({ title, matches }) => {
    if (matches.length === 0) return null;
    return (
      <div style={{ marginBottom: '24px' }}>
        <p style={{ color: '#c9a227', fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>{title} <span style={{ color: '#4a6a82', fontWeight: 400 }}>({matches.length})</span></p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {matches.map((m) => <MatchCard key={m._id} m={m} />)}
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      {/* Toss Setup Modal */}
      {tossModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#112240', border: '1px solid rgba(201,162,39,0.3)', borderRadius: '10px', padding: '24px', maxWidth: '420px', width: '100%', margin: '0 16px' }}>
            <p style={{ color: '#c9a227', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>Set Toss Details</p>
            <p style={{ color: '#4a6a82', fontSize: '12px', marginBottom: '20px' }}>{tossModal.teamA?.name} vs {tossModal.teamB?.name}</p>
            
            <form onSubmit={saveToss}>
              <div style={{ marginBottom: '16px' }}>
                <label className="block text-xs font-medium mb-2" style={{ color: '#8aacbf' }}>Toss Winner</label>
                <select 
                  required
                  value={tossForm.tossWinner}
                  onChange={(e) => setTossForm({ ...tossForm, tossWinner: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                  style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                  <option value="">Select Team</option>
                  <option value={tossModal.teamA?._id || tossModal.teamA}>{tossModal.teamA?.name}</option>
                  <option value={tossModal.teamB?._id || tossModal.teamB}>{tossModal.teamB?.name}</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="block text-xs font-medium mb-2" style={{ color: '#8aacbf' }}>Chose to</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setTossForm({ ...tossForm, tossDecision: 'bat' })}
                    style={{ 
                      flex: 1, 
                      padding: '10px', 
                      borderRadius: '6px', 
                      background: tossForm.tossDecision === 'bat' ? '#c9a227' : 'rgba(255,255,255,0.05)', 
                      color: tossForm.tossDecision === 'bat' ? '#0a1628' : '#8aacbf',
                      border: tossForm.tossDecision === 'bat' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer', 
                      fontWeight: 600, 
                      fontSize: '13px' 
                    }}>
                    Bat First
                  </button>
                  <button
                    type="button"
                    onClick={() => setTossForm({ ...tossForm, tossDecision: 'bowl' })}
                    style={{ 
                      flex: 1, 
                      padding: '10px', 
                      borderRadius: '6px', 
                      background: tossForm.tossDecision === 'bowl' ? '#c9a227' : 'rgba(255,255,255,0.05)', 
                      color: tossForm.tossDecision === 'bowl' ? '#0a1628' : '#8aacbf',
                      border: tossForm.tossDecision === 'bowl' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer', 
                      fontWeight: 600, 
                      fontSize: '13px' 
                    }}>
                    Bowl First
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setTossModal(null)} style={{ flex: 1, padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#8aacbf', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#c9a227', color: '#0a1628', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Save Toss</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#112240', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '10px', padding: '24px', maxWidth: '360px', width: '100%', margin: '0 16px' }}>
            <p style={{ color: '#ef4444', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>Delete Match?</p>
            <p style={{ color: '#4a6a82', fontSize: '13px', marginBottom: '20px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '8px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#8aacbf', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '8px', borderRadius: '6px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 style={{ color: '#ffffff', fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Manage Matches</h1>
            <p style={{ color: '#4a6a82', fontSize: '13px' }}>Schedule, score and complete matches</p>
          </div>
          <button onClick={() => {
              if (showCreateForm && editingMatch) {
                setEditingMatch(null);
                setForm({ teamA: '', teamB: '', stage: 'group', group: 'A', ground: 'Ground 1', overs: 5, date: '', round: 1 });
              }
              setShowCreateForm(!showCreateForm);
            }}
            style={{ padding: '8px 20px', borderRadius: '6px', background: '#c9a227', color: '#0a1628', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
            {showCreateForm ? 'Cancel' : '+ Create Match'}
          </button>
        </div>

        {msg && (
          <div style={{ background: 'rgba(201,162,39,0.1)', color: '#c9a227', border: '1px solid rgba(201,162,39,0.3)', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>
            {msg}
          </div>
        )}

        {showCreateForm && (
          <div style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
            <p style={{ color: '#8aacbf', fontSize: '12px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {editingMatch ? 'Edit Match' : 'Create New Match'}
            </p>
            
            <form onSubmit={handleCreateMatch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#8aacbf' }}>Team A</label>
                  <select 
                    required 
                    value={form.teamA}
                    onChange={(e) => setForm({ ...form, teamA: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                    style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                    <option value="">Select Team A</option>
                    {teams.map((t) => (
                      <option key={t._id} value={t._id}>{t.name} (Group {t.group})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#8aacbf' }}>Team B</label>
                  <select 
                    required 
                    value={form.teamB}
                    onChange={(e) => setForm({ ...form, teamB: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                    style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                    <option value="">Select Team B</option>
                    {teams.map((t) => (
                      <option key={t._id} value={t._id}>{t.name} (Group {t.group})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#8aacbf' }}>Match Type</label>
                  <select 
                    value={form.stage}
                    onChange={(e) => {
                      const stage = e.target.value;
                      setForm({ 
                        ...form, 
                        stage,
                        group: stage === 'group' ? 'A' : stage === 'semi' ? 'Semi Final 1' : 'Final',
                        round: stage === 'group' ? 1 : undefined
                      });
                    }}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                    style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                    <option value="group">Group Stage</option>
                    <option value="semi">Semi Final</option>
                    <option value="final">Final</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#8aacbf' }}>
                    {form.stage === 'group' ? 'Group' : form.stage === 'semi' ? 'Semi Final' : 'Match'}
                  </label>
                  {form.stage === 'group' ? (
                    <select 
                      value={form.group}
                      onChange={(e) => setForm({ ...form, group: e.target.value })}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                      style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                      <option value="A">Group A</option>
                      <option value="B">Group B</option>
                    </select>
                  ) : form.stage === 'semi' ? (
                    <select 
                      value={form.group}
                      onChange={(e) => setForm({ ...form, group: e.target.value })}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                      style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                      <option value="Semi Final 1">Semi Final 1</option>
                      <option value="Semi Final 2">Semi Final 2</option>
                    </select>
                  ) : (
                    <input 
                      type="text"
                      value="Final"
                      disabled
                      className="w-full rounded-lg px-3 py-2 text-sm"
                      style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', color: '#8aacbf' }}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#8aacbf' }}>Ground</label>
                  <select 
                    value={form.ground}
                    onChange={(e) => setForm({ ...form, ground: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                    style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                    <option value="Ground 1">Ground 1</option>
                    <option value="Ground 2">Ground 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#8aacbf' }}>Overs</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="50"
                    value={form.overs}
                    onChange={(e) => setForm({ ...form, overs: Number(e.target.value) })}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                    style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                  />
                </div>

                {form.stage === 'group' && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#8aacbf' }}>Round</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10"
                      value={form.round}
                      onChange={(e) => setForm({ ...form, round: Number(e.target.value) })}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                      style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                    />
                  </div>
                )}

                <div className={form.stage === 'group' ? '' : 'col-span-2'}>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#8aacbf' }}>Date</label>
                  <input 
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                    style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full px-4 py-2.5 rounded-lg font-bold text-sm transition hover:opacity-90"
                style={{ background: '#c9a227', color: '#0a1628' }}>
                {editingMatch ? 'Update Match' : 'Create Match'}
              </button>
            </form>
          </div>
        )}

        {matches.length === 0 ? (
          <div className="rounded-xl p-6 text-center animate-slide-up animate-delay-100" style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ color: '#8aacbf' }}>No matches yet. <Link href="/admin/schedule" className="underline" style={{ color: '#c9a227' }}>Generate schedule first</Link></p>
          </div>
        ) : (
          <>
            <StageSection 
              title="Group A Matches" 
              matches={groupAMatches}
              delay={100}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              }
            />
            
            <StageSection 
              title="Group B Matches" 
              matches={groupBMatches}
              delay={200}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              }
            />
            
            <StageSection 
              title="Semi Finals" 
              matches={semiMatches}
              delay={300}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              }
            />
            
            <StageSection 
              title="Final" 
              matches={finalMatches}
              delay={400}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                  <path d="M4 22h16"/>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                </svg>
              }
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
