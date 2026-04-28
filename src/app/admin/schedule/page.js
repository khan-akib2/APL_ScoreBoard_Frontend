'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

export default function AdminSchedule() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [overs, setOvers] = useState(5);
  const [date, setDate] = useState('');
  const [msg, setMsg] = useState('');
  const [generating, setGenerating] = useState(false);
  const [teams, setTeams] = useState([]);
  const [semiForm, setSemiForm] = useState({
    teamA1: '', teamB1: '', teamA2: '', teamB2: '', date: '', overs: 5
  });
  const [finalForm, setFinalForm] = useState({
    teamA: '', teamB: '', date: '', overs: 5
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
    else loadTeams();
  }, [loading, user]);

  const loadTeams = () => api.get('/teams').then((d) => { if (Array.isArray(d)) setTeams(d); });

  const generate = async (type) => {
    if (!date) {
      setMsg('Please select a start date first');
      return;
    }
    setGenerating(true);
    setMsg('');
    const res = await api.post('/matches/generate-schedule', { overs, date });
    setMsg(res.message || res.error || JSON.stringify(res));
    setGenerating(false);
  };

  const createSemiFinals = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!semiForm.teamA1 || !semiForm.teamB1 || !semiForm.teamA2 || !semiForm.teamB2) {
      setMsg('Please select all teams for both semi finals');
      return;
    }
    if (!semiForm.date) {
      setMsg('Please select a date for semi finals');
      return;
    }
    setGenerating(true);
    
    // Create Semi Final 1
    const semi1 = await api.post('/matches', {
      teamA: semiForm.teamA1,
      teamB: semiForm.teamB1,
      stage: 'semi',
      group: 'Semi Final 1',
      ground: 'Ground 1',
      overs: semiForm.overs,
      date: semiForm.date || new Date(),
      status: 'scheduled'
    });
    
    // Create Semi Final 2
    const semi2 = await api.post('/matches', {
      teamA: semiForm.teamA2,
      teamB: semiForm.teamB2,
      stage: 'semi',
      group: 'Semi Final 2',
      ground: 'Ground 2',
      overs: semiForm.overs,
      date: semiForm.date || new Date(),
      status: 'scheduled'
    });
    
    if (semi1._id && semi2._id) {
      setMsg('Semi Finals created successfully!');
      setSemiForm({ teamA1: '', teamB1: '', teamA2: '', teamB2: '', date: '', overs: 5 });
    } else {
      setMsg('Error creating semi finals');
    }
    setGenerating(false);
  };

  const createFinal = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!finalForm.teamA || !finalForm.teamB) {
      setMsg('Please select both teams for final');
      return;
    }
    if (!finalForm.date) {
      setMsg('Please select a date for final');
      return;
    }
    setGenerating(true);
    
    const final = await api.post('/matches', {
      teamA: finalForm.teamA,
      teamB: finalForm.teamB,
      stage: 'final',
      group: 'Final',
      ground: 'Ground 1',
      overs: finalForm.overs,
      date: finalForm.date || new Date(),
      status: 'scheduled'
    });
    
    if (final._id) {
      setMsg('Final created successfully!');
      setFinalForm({ teamA: '', teamB: '', date: '', overs: 5 });
    } else {
      setMsg('Error creating final');
    }
    setGenerating(false);
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <h1 style={{ color: '#ffffff', fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>Generate Schedule</h1>
        <p style={{ color: '#4a6a82', fontSize: '13px', marginBottom: '24px' }}>Create fixtures and knockout rounds</p>

        <div style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px' }}>
          {msg && <p style={{ background: 'rgba(201,162,39,0.1)', color: '#c9a227', border: '1px solid rgba(201,162,39,0.3)', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', marginBottom: '16px' }}>{msg}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#8aacbf' }}>Overs per match</label>
              <input type="number" min={1} max={50} value={overs}
                onChange={(e) => setOvers(Number(e.target.value))}
                className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#8aacbf' }}>Start Date *</label>
              <input type="date" value={date} required
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg px-3 py-2 focus:outline-none text-sm"
                style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
            {/* Group Stage */}
            <div className="rounded-xl p-4" style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="font-semibold mb-1 text-sm" style={{ color: '#ffffff' }}>Generate Group Stage Fixtures</h3>
              <p className="text-sm mb-3" style={{ color: '#8aacbf' }}>
                Generates 6 matches per group (round-robin). Group A teams play among themselves, Group B teams play among themselves.
              </p>
              <button onClick={() => generate('group')} disabled={generating}
                className="w-full px-4 py-2 rounded-lg transition disabled:opacity-50 text-sm font-bold hover:opacity-90"
                style={{ background: '#c9a227', color: '#0a1628' }}>
                {generating ? 'Generating...' : 'Generate Group Fixtures'}
              </button>
            </div>

            {/* Semi Finals */}
            <div className="rounded-xl p-4" style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="font-semibold mb-3 text-sm" style={{ color: '#ffffff' }}>Create Semi Finals</h3>
              <form onSubmit={createSemiFinals} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold" style={{ color: '#c9a227' }}>Semi Final 1</p>
                    <select value={semiForm.teamA1} onChange={(e) => setSemiForm({ ...semiForm, teamA1: e.target.value })}
                      className="w-full rounded-lg px-2 py-2 focus:outline-none text-xs"
                      style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                      <option value="">Team A</option>
                      {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                    <select value={semiForm.teamB1} onChange={(e) => setSemiForm({ ...semiForm, teamB1: e.target.value })}
                      className="w-full rounded-lg px-2 py-2 focus:outline-none text-xs"
                      style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                      <option value="">Team B</option>
                      {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold" style={{ color: '#c9a227' }}>Semi Final 2</p>
                    <select value={semiForm.teamA2} onChange={(e) => setSemiForm({ ...semiForm, teamA2: e.target.value })}
                      className="w-full rounded-lg px-2 py-2 focus:outline-none text-xs"
                      style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                      <option value="">Team A</option>
                      {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                    <select value={semiForm.teamB2} onChange={(e) => setSemiForm({ ...semiForm, teamB2: e.target.value })}
                      className="w-full rounded-lg px-2 py-2 focus:outline-none text-xs"
                      style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                      <option value="">Team B</option>
                      {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#8aacbf' }}>Date *</label>
                    <input type="date" value={semiForm.date} required onChange={(e) => setSemiForm({ ...semiForm, date: e.target.value })}
                      className="w-full rounded-lg px-2 py-2 focus:outline-none text-xs"
                      style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#8aacbf' }}>Overs</label>
                    <input type="number" min="1" max="50" value={semiForm.overs}
                      onChange={(e) => setSemiForm({ ...semiForm, overs: Number(e.target.value) })}
                      className="w-full rounded-lg px-2 py-2 focus:outline-none text-xs"
                      style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
                  </div>
                </div>
                <button type="submit" disabled={generating}
                  className="w-full px-4 py-2 rounded-lg transition disabled:opacity-50 text-sm font-bold hover:opacity-90"
                  style={{ background: '#c9a227', color: '#0a1628' }}>
                  Create Semi Finals
                </button>
              </form>
            </div>

            {/* Final */}
            <div className="rounded-xl p-4" style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="font-semibold mb-3 text-sm" style={{ color: '#ffffff' }}>Create Final</h3>
              <form onSubmit={createFinal} className="space-y-3">
                <div className="space-y-2">
                  <select value={finalForm.teamA} onChange={(e) => setFinalForm({ ...finalForm, teamA: e.target.value })}
                    className="w-full rounded-lg px-2 py-2 focus:outline-none text-sm"
                    style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                    <option value="">Team A</option>
                    {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                  <select value={finalForm.teamB} onChange={(e) => setFinalForm({ ...finalForm, teamB: e.target.value })}
                    className="w-full rounded-lg px-2 py-2 focus:outline-none text-sm"
                    style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                    <option value="">Team B</option>
                    {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#8aacbf' }}>Date *</label>
                    <input type="date" value={finalForm.date} required onChange={(e) => setFinalForm({ ...finalForm, date: e.target.value })}
                      className="w-full rounded-lg px-2 py-2 focus:outline-none text-xs"
                      style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: '#8aacbf' }}>Overs</label>
                    <input type="number" min="1" max="50" value={finalForm.overs}
                      onChange={(e) => setFinalForm({ ...finalForm, overs: Number(e.target.value) })}
                      className="w-full rounded-lg px-2 py-2 focus:outline-none text-xs"
                      style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }} />
                  </div>
                </div>
                <button type="submit" disabled={generating}
                  className="w-full px-4 py-2 rounded-lg transition disabled:opacity-50 text-sm font-bold hover:opacity-90"
                  style={{ background: '#c9a227', color: '#0a1628' }}>
                  Create Final
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
