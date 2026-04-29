'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const C = {
  bg0:'#060e1a', bg1:'#0a1628', bg2:'#0f1e35',
  border:'rgba(255,255,255,0.07)',
  gold:'#c9a227', goldDim:'rgba(201,162,39,0.1)',
  red:'#ef4444', green:'#22c55e',
  text:'#e8e8e8', muted:'#8b9db7', dim:'#4a6a82',
};

const inp = {
  width:'100%', padding:'10px 12px',
  background:C.bg0, border:`1px solid ${C.border}`,
  borderRadius:8, color:C.text, fontSize:13,
  outline:'none', fontFamily:'inherit',
  transition:'border-color .15s', boxSizing:'border-box',
};

function Field({ label, children }) {
  return (
    <div>
      <p style={{ fontSize:10, fontWeight:700, color:C.dim, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:7 }}>{label}</p>
      {children}
    </div>
  );
}

function StageCard({ step, title, subtitle, icon, children, accent }) {
  return (
    <div style={{
      background:C.bg1,
      border:`1px solid ${accent || C.border}`,
      borderRadius:14, overflow:'hidden',
      boxShadow:'0 0 0 1px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.3)',
    }}>
      {/* Card header */}
      <div style={{
        padding:'16px 20px',
        background:'linear-gradient(135deg, #0f1e35, #0a1628)',
        borderBottom:`1px solid ${accent || C.border}`,
        display:'flex', alignItems:'center', gap:14,
      }}>
        <div style={{
          width:40, height:40, borderRadius:10, flexShrink:0,
          background: accent ? `${accent.replace('rgba','rgba').replace('0.15','0.12')}` : C.goldDim,
          border:`1px solid ${accent || 'rgba(201,162,39,0.2)'}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          color: accent ? C.text : C.gold,
        }}>{icon}</div>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:9, fontWeight:800, color:C.dim, letterSpacing:'0.14em', textTransform:'uppercase' }}>STAGE {step}</span>
          </div>
          <p style={{ fontSize:14, fontWeight:800, color:C.text, marginTop:1 }}>{title}</p>
          <p style={{ fontSize:11, color:C.dim, marginTop:1 }}>{subtitle}</p>
        </div>
      </div>
      {/* Card body */}
      <div style={{ padding:'20px' }}>{children}</div>
    </div>
  );
}

export default function AdminSchedule() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [overs, setOvers]   = useState(5);
  const [time, setTime]     = useState('');   // HH:MM — time on match day (May 2nd)
  const [toast, setToast]   = useState({ text:'', type:'ok' });
  const [busy, setBusy]     = useState(false);
  const [teams, setTeams]   = useState([]);
  const [semiForm, setSemiForm] = useState({ teamA1:'', teamB1:'', teamA2:'', teamB2:'', time:'', overs:5 });
  const [finalForm, setFinalForm] = useState({ teamA:'', teamB:'', time:'', overs:5 });

  // Match day is fixed: May 2nd 2026
  const MATCH_DAY = '2026-05-02';

  const buildDate = (t) => t ? `${MATCH_DAY}T${t}:00` : MATCH_DAY;

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
    else if (!loading && user) api.get('/teams').then(d => { if (Array.isArray(d)) setTeams(d); });
  }, [loading, user]);

  const showToast = (text, type='ok') => { setToast({ text, type }); setTimeout(() => setToast({ text:'', type:'ok' }), 4000); };

  const generateGroup = async () => {
    setBusy(true);
    const res = await api.post('/matches/generate-schedule', { overs, date: buildDate(time) });
    setBusy(false);
    showToast(res.message || 'Done', res.message?.toLowerCase().includes('error') ? 'err' : 'ok');
  };

  const createSemis = async (e) => {
    e.preventDefault();
    if (!semiForm.teamA1||!semiForm.teamB1||!semiForm.teamA2||!semiForm.teamB2) { showToast('Select all teams', 'err'); return; }
    setBusy(true);
    const [s1, s2] = await Promise.all([
      api.post('/matches', { teamA:semiForm.teamA1, teamB:semiForm.teamB1, stage:'semi', group:'Semi Final 1', ground:'Ground 1', overs:semiForm.overs, date:buildDate(semiForm.time), status:'scheduled' }),
      api.post('/matches', { teamA:semiForm.teamA2, teamB:semiForm.teamB2, stage:'semi', group:'Semi Final 2', ground:'Ground 2', overs:semiForm.overs, date:buildDate(semiForm.time), status:'scheduled' }),
    ]);
    setBusy(false);
    if (s1._id && s2._id) { showToast('Semi Finals created'); setSemiForm({ teamA1:'', teamB1:'', teamA2:'', teamB2:'', time:'', overs:5 }); }
    else showToast('Error creating semi finals', 'err');
  };

  const createFinal = async (e) => {
    e.preventDefault();
    if (!finalForm.teamA||!finalForm.teamB) { showToast('Select both teams', 'err'); return; }
    setBusy(true);
    const res = await api.post('/matches', { teamA:finalForm.teamA, teamB:finalForm.teamB, stage:'final', group:'Final', ground:'Ground 1', overs:finalForm.overs, date:buildDate(finalForm.time), status:'scheduled' });
    setBusy(false);
    if (res._id) { showToast('Final created'); setFinalForm({ teamA:'', teamB:'', time:'', overs:5 }); }
    else showToast('Error creating final', 'err');
  };

  const TeamSelect = ({ value, onChange, placeholder }) => (
    <select value={value} onChange={onChange} style={inp}>
      <option value="">{placeholder}</option>
      {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
    </select>
  );

  const SubmitBtn = ({ label, disabled }) => (
    <button type="submit" disabled={disabled || busy} style={{
      width:'100%', padding:'11px', borderRadius:9, border:'none',
      cursor: (disabled||busy) ? 'not-allowed' : 'pointer',
      background: (disabled||busy) ? 'rgba(201,162,39,0.4)' : 'linear-gradient(135deg,#d4a82a,#c9a227)',
      color:C.bg0, fontWeight:800, fontSize:13, fontFamily:'inherit',
      display:'flex', alignItems:'center', justifyContent:'center', gap:7,
      boxShadow: (disabled||busy) ? 'none' : '0 4px 16px rgba(201,162,39,0.2)',
      marginTop:4,
    }}>
      {busy && <div style={{ width:13, height:13, border:'2px solid rgba(6,14,26,0.25)', borderTopColor:C.bg0, borderRadius:'50%', animation:'spin .7s linear infinite' }} />}
      {busy ? 'Working…' : label}
    </button>
  );

  return (
    <AdminLayout>
      <div style={{ padding: '16px' }} className="admin-page-pad">

        {/* ── Header ── */}
        <div style={{ marginBottom:28 }}>
          <p style={{ fontSize:10, fontWeight:700, color:C.gold, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:6 }}>Tournament Setup</p>
          <h1 style={{ fontSize:24, fontWeight:900, color:C.text, letterSpacing:'-0.02em', marginBottom:4 }}>Generate Schedule</h1>
          <p style={{ fontSize:13, color:C.dim }}>Create group fixtures and knockout rounds in sequence</p>
        </div>

        {/* ── Toast ── */}
        {toast.text && (
          <div style={{
            padding:'10px 16px', borderRadius:8, marginBottom:20, fontSize:13, fontWeight:500,
            background: toast.type==='err' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.07)',
            color: toast.type==='err' ? C.red : C.green,
            border:`1px solid ${toast.type==='err' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
            display:'flex', alignItems:'center', gap:8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {toast.type==='err'
                ? <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                : <><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></>}
            </svg>
            {toast.text}
          </div>
        )}

        {/* ── Global settings ── */}
        <div style={{ background:C.bg1, border:`1px solid ${C.border}`, borderRadius:12, padding:'18px 20px', marginBottom:24 }}>
          <p style={{ fontSize:10, fontWeight:700, color:C.dim, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>Global Settings</p>
          <p style={{ fontSize:12, color:C.dim, marginBottom:14 }}>Match day is fixed: <strong style={{ color:C.gold }}>2nd May 2026</strong> · Set start time for group fixtures</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }} className="settings-grid">
            <Field label="Overs per match">
              <input type="number" min={1} max={50} value={overs} onChange={e => setOvers(Number(e.target.value))}
                style={{ ...inp, cursor:'text' }}
                onFocus={e => e.target.style.borderColor='rgba(201,162,39,0.4)'}
                onBlur={e => e.target.style.borderColor=C.border} />
            </Field>
            <Field label="Start Time (optional)">
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                style={{ ...inp, cursor:'text' }}
                onFocus={e => e.target.style.borderColor='rgba(201,162,39,0.4)'}
                onBlur={e => e.target.style.borderColor=C.border} />
            </Field>
          </div>
        </div>

        {/* ── Stage cards ── */}
        <div className="schedule-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }}>

          {/* Stage 1 — Group */}
          <StageCard step="1" title="Group Stage" subtitle="Round-robin · 6 matches per group"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}
          >
            <p style={{ fontSize:13, color:C.muted, lineHeight:1.65, marginBottom:20 }}>
              Generates 6 matches per group using a round-robin format. Every team plays 3 matches. Requires exactly 4 teams in each group.
            </p>
            <div style={{ padding:'12px 14px', borderRadius:9, background:'rgba(255,255,255,0.02)', border:`1px solid ${C.border}`, marginBottom:16, fontSize:12, color:C.dim }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span>Group A teams</span><strong style={{ color:C.text }}>{teams.filter(t=>t.group==='A').length} / 4</strong>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span>Group B teams</span><strong style={{ color:C.text }}>{teams.filter(t=>t.group==='B').length} / 4</strong>
              </div>
            </div>
            <button onClick={generateGroup} disabled={busy} style={{
              width:'100%', padding:'11px', borderRadius:9, border:'none',
              cursor:busy?'not-allowed':'pointer',
              background:busy?'rgba(201,162,39,0.4)':'linear-gradient(135deg,#d4a82a,#c9a227)',
              color:C.bg0, fontWeight:800, fontSize:13, fontFamily:'inherit',
              display:'flex', alignItems:'center', justifyContent:'center', gap:7,
              boxShadow:busy?'none':'0 4px 16px rgba(201,162,39,0.2)',
            }}>
              {busy && <div style={{ width:13, height:13, border:'2px solid rgba(6,14,26,0.25)', borderTopColor:C.bg0, borderRadius:'50%', animation:'spin .7s linear infinite' }} />}
              {busy ? 'Generating…' : 'Generate Group Fixtures'}
            </button>
          </StageCard>

          {/* Stage 2 — Semis */}
          <StageCard step="2" title="Semi Finals" subtitle="Knockout · 2 matches"
            accent="rgba(96,165,250,0.15)"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blue||'#60a5fa'} strokeWidth="1.8"><path d="M8 6l4-4 4 4"/><path d="M12 2v10.3"/><path d="M8 18l4 4 4-4"/><path d="M12 22v-4"/><path d="M4 12H2"/><path d="M22 12h-2"/></svg>}
          >
            <form onSubmit={createSemis} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div className="semis-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                  <p style={{ fontSize:10, fontWeight:700, color:'#60a5fa', letterSpacing:'0.1em', textTransform:'uppercase' }}>SF 1 — Ground 1</p>
                  <TeamSelect value={semiForm.teamA1} onChange={e => setSemiForm({...semiForm, teamA1:e.target.value})} placeholder="Team A" />
                  <TeamSelect value={semiForm.teamB1} onChange={e => setSemiForm({...semiForm, teamB1:e.target.value})} placeholder="Team B" />
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                  <p style={{ fontSize:10, fontWeight:700, color:'#60a5fa', letterSpacing:'0.1em', textTransform:'uppercase' }}>SF 2 — Ground 2</p>
                  <TeamSelect value={semiForm.teamA2} onChange={e => setSemiForm({...semiForm, teamA2:e.target.value})} placeholder="Team A" />
                  <TeamSelect value={semiForm.teamB2} onChange={e => setSemiForm({...semiForm, teamB2:e.target.value})} placeholder="Team B" />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <Field label="Time">
                  <input type="time" value={semiForm.time} onChange={e => setSemiForm({...semiForm, time:e.target.value})}
                    style={{ ...inp, cursor:'text' }}
                    onFocus={e => e.target.style.borderColor='rgba(96,165,250,0.4)'}
                    onBlur={e => e.target.style.borderColor=C.border} />
                </Field>
                <Field label="Overs">
                  <input type="number" min="1" max="50" value={semiForm.overs} onChange={e => setSemiForm({...semiForm, overs:Number(e.target.value)})}
                    style={{ ...inp, cursor:'text' }}
                    onFocus={e => e.target.style.borderColor='rgba(96,165,250,0.4)'}
                    onBlur={e => e.target.style.borderColor=C.border} />
                </Field>
              </div>
              <SubmitBtn label="Create Semi Finals" />
            </form>
          </StageCard>

          {/* Stage 3 — Final */}
          <StageCard step="3" title="Grand Final" subtitle="Championship · 1 match"
            accent="rgba(201,162,39,0.2)"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>}
          >
            <form onSubmit={createFinal} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <Field label="Team A">
                <TeamSelect value={finalForm.teamA} onChange={e => setFinalForm({...finalForm, teamA:e.target.value})} placeholder="Select Team A" />
              </Field>
              <Field label="Team B">
                <TeamSelect value={finalForm.teamB} onChange={e => setFinalForm({...finalForm, teamB:e.target.value})} placeholder="Select Team B" />
              </Field>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <Field label="Time">
                  <input type="time" value={finalForm.time} onChange={e => setFinalForm({...finalForm, time:e.target.value})}
                    style={{ ...inp, cursor:'text' }}
                    onFocus={e => e.target.style.borderColor='rgba(201,162,39,0.4)'}
                    onBlur={e => e.target.style.borderColor=C.border} />
                </Field>
                <Field label="Overs">
                  <input type="number" min="1" max="50" value={finalForm.overs} onChange={e => setFinalForm({...finalForm, overs:Number(e.target.value)})}
                    style={{ ...inp, cursor:'text' }}
                    onFocus={e => e.target.style.borderColor='rgba(201,162,39,0.4)'}
                    onBlur={e => e.target.style.borderColor=C.border} />
                </Field>
              </div>
              <SubmitBtn label="Create Grand Final" />
            </form>
          </StageCard>

        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
