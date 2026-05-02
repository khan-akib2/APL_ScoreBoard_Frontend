'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const C = {
  bg0:'#060e1a', bg1:'#0a1628', bg2:'#0f1e35',
  border:'rgba(255,255,255,0.07)',
  gold:'#c9a227', goldDim:'rgba(201,162,39,0.1)',
  red:'#ef4444', redDim:'rgba(239,68,68,0.1)',
  green:'#22c55e', blue:'#60a5fa',
  text:'#e8e8e8', muted:'#8b9db7', dim:'#4a6a82',
};

const sel = {
  width:'100%', padding:'10px 12px',
  background:C.bg0, border:`1px solid ${C.border}`,
  borderRadius:8, color:C.text, fontSize:13,
  outline:'none', fontFamily:'inherit', cursor:'pointer',
};

const STATUS = {
  live:      { label:'LIVE',      color:'#ef4444', bg:'rgba(239,68,68,0.1)',      border:'rgba(239,68,68,0.25)'      },
  scheduled: { label:'SCHEDULED', color:'#8b9db7', bg:'rgba(139,157,183,0.08)',   border:'rgba(139,157,183,0.2)'     },
  completed: { label:'DONE',      color:'#22c55e', bg:'rgba(34,197,94,0.08)',      border:'rgba(34,197,94,0.2)'       },
};

export default function AdminMatches() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [matches, setMatches]   = useState([]);
  const [teams, setTeams]       = useState([]);
  const [panel, setPanel]       = useState(null); // null | 'create' | match-object (edit)
  const [form, setForm] = useState({ teamA:'', teamB:'', stage:'group', group:'A', overs:5, time:'' });
  const [tossModal, setTossModal]   = useState(null);
  const [tossForm, setTossForm]     = useState({ tossWinner:'', tossDecision:'bat' });
  const [deleteId, setDeleteId]     = useState(null);
  const [toast, setToast]           = useState({ text:'', type:'ok' });
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
    else if (!loading && user) load();
  }, [loading, user]);

  const load = () => Promise.all([api.get('/matches'), api.get('/teams')]).then(([m, t]) => {
    if (Array.isArray(m)) setMatches(m);
    if (Array.isArray(t)) setTeams(t);
  });

  const showToast = (text, type='ok') => { setToast({ text, type }); setTimeout(() => setToast({ text:'', type:'ok' }), 3000); };

  const openCreate = () => {
    setForm({ teamA:'', teamB:'', stage:'group', group:'A', overs:5, time:'' });
    setPanel('create');
  };

  const openEdit = (m) => {
    const t = m.date ? new Date(m.date).toTimeString().slice(0,5) : '';
    setForm({ teamA: m.teamA?._id||m.teamA, teamB: m.teamB?._id||m.teamB, stage: m.stage, group: m.group, overs: m.overs, time: t });
    setPanel(m);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.teamA === form.teamB) { showToast('Select different teams', 'err'); return; }
    setSaving(true);
    const MATCH_DAY = '2026-05-02';
    const date = form.time ? `${MATCH_DAY}T${form.time}:00` : MATCH_DAY;
    const ground = form.stage === 'group' ? (form.group === 'A' ? 'Ground 1' : 'Ground 2') : 'Ground 1';
    const data = { teamA: form.teamA, teamB: form.teamB, stage: form.stage, group: form.group, ground, overs: form.overs, date, status: panel === 'create' ? 'scheduled' : panel.status };
    const res = panel === 'create' ? await api.post('/matches', data) : await api.put(`/matches/${panel._id}`, data);
    setSaving(false);
    if (res._id) { showToast(panel === 'create' ? 'Match created' : 'Match updated'); setPanel(null); load(); }
    else showToast(res.message || 'Error', 'err');
  };

  const setStatus = async (id, status) => { await api.put(`/matches/${id}`, { status }); load(); };

  const openToss = (m) => { setTossModal(m); setTossForm({ tossWinner: m.tossWinner?._id||m.tossWinner||'', tossDecision: m.tossDecision||'bat' }); };

  const saveToss = async (e) => {
    e.preventDefault();
    await api.put(`/matches/${tossModal._id}`, { tossWinner: tossForm.tossWinner, tossDecision: tossForm.tossDecision });
    setTossModal(null); load(); showToast('Toss saved');
  };

  const confirmDelete = async () => {
    await api.delete(`/matches/${deleteId}`);
    setDeleteId(null); load(); showToast('Match deleted');
  };

  const sections = [
    { title:'Group A', matches: matches.filter(m => m.group === 'A') },
    { title:'Group B', matches: matches.filter(m => m.group === 'B') },
    { title:'Semi Finals', matches: matches.filter(m => m.stage === 'semi') },
    { title:'Final', matches: matches.filter(m => m.stage === 'final') },
  ].filter(s => s.matches.length > 0);

  return (
    <AdminLayout>

      {/* ── Delete confirm ── */}
      {deleteId && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:60 }}>
          <div style={{ background:C.bg1, border:'1px solid rgba(239,68,68,0.2)', borderRadius:14, padding:28, maxWidth:360, width:'100%', margin:'0 16px' }}>
            <p style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:6 }}>Delete match?</p>
            <p style={{ fontSize:13, color:C.dim, marginBottom:24 }}>This cannot be undone.</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex:1, padding:10, borderRadius:8, background:'rgba(255,255,255,0.04)', color:C.muted, border:`1px solid ${C.border}`, cursor:'pointer', fontWeight:600, fontSize:13, fontFamily:'inherit' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex:1, padding:10, borderRadius:8, background:C.red, color:'#fff', border:'none', cursor:'pointer', fontWeight:700, fontSize:13, fontFamily:'inherit' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toss modal ── */}
      {tossModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:60 }}>
          <div style={{ background:C.bg1, border:`1px solid rgba(201,162,39,0.2)`, borderRadius:14, padding:28, maxWidth:400, width:'100%', margin:'0 16px' }}>
            <p style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:4 }}>Set Toss</p>
            <p style={{ fontSize:12, color:C.dim, marginBottom:20 }}>{tossModal.teamA?.name} vs {tossModal.teamB?.name}</p>
            <form onSubmit={saveToss}>
              <div style={{ marginBottom:14 }}>
                <p style={{ fontSize:10, fontWeight:700, color:C.dim, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>Toss Winner</p>
                <select required value={tossForm.tossWinner} onChange={e => setTossForm({ ...tossForm, tossWinner:e.target.value })} style={sel}>
                  <option value="">Select team</option>
                  <option value={tossModal.teamA?._id||tossModal.teamA}>{tossModal.teamA?.name}</option>
                  <option value={tossModal.teamB?._id||tossModal.teamB}>{tossModal.teamB?.name}</option>
                </select>
              </div>
              <div style={{ marginBottom:20 }}>
                <p style={{ fontSize:10, fontWeight:700, color:C.dim, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>Elected to</p>
                <div style={{ display:'flex', gap:8 }}>
                  {['bat','bowl'].map(d => (
                    <button key={d} type="button" onClick={() => setTossForm({ ...tossForm, tossDecision:d })} style={{
                      flex:1, padding:'10px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:700, fontSize:13, fontFamily:'inherit',
                      background: tossForm.tossDecision === d ? `linear-gradient(135deg,#d4a82a,${C.gold})` : 'rgba(255,255,255,0.04)',
                      color: tossForm.tossDecision === d ? C.bg0 : C.muted,
                      outline: tossForm.tossDecision !== d ? `1px solid ${C.border}` : 'none',
                    }}>{d === 'bat' ? 'Bat First' : 'Bowl First'}</button>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="button" onClick={() => setTossModal(null)} style={{ flex:1, padding:10, borderRadius:8, background:'rgba(255,255,255,0.04)', color:C.muted, border:`1px solid ${C.border}`, cursor:'pointer', fontWeight:600, fontSize:13, fontFamily:'inherit' }}>Cancel</button>
                <button type="submit" style={{ flex:1, padding:10, borderRadius:8, background:`linear-gradient(135deg,#d4a82a,${C.gold})`, color:C.bg0, border:'none', cursor:'pointer', fontWeight:700, fontSize:13, fontFamily:'inherit' }}>Save Toss</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Main layout ── */}
      <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>

        {/* LEFT — match list inside iframe */}
        <div className="admin-page-pad" style={{ flex: 1, overflowY: 'auto' }}>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 style={{ fontSize:24, fontWeight:900, color:C.text, letterSpacing:'-0.02em', marginBottom:4 }}>Matches</h1>
              <p style={{ fontSize:13, color:C.dim }}>{matches.length} total · {matches.filter(m=>m.status==='live').length} live</p>
            </div>
            <button onClick={openCreate} style={{
              padding:'10px 20px', borderRadius:9, border:'none', cursor:'pointer',
              background:`linear-gradient(135deg,#d4a82a,${C.gold})`, color:C.bg0,
              fontWeight:800, fontSize:13, fontFamily:'inherit',
              display:'flex', alignItems:'center', gap:7,
              boxShadow:'0 4px 16px rgba(201,162,39,0.2)',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Match
            </button>
          </div>

          {/* Toast */}
          {toast.text && (
            <div style={{ padding:'10px 16px', borderRadius:8, marginBottom:16, fontSize:13, fontWeight:500,
              background: toast.type==='err' ? C.redDim : 'rgba(34,197,94,0.07)',
              color: toast.type==='err' ? C.red : C.green,
              border:`1px solid ${toast.type==='err' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
            }}>{toast.text}</div>
          )}

          {/* ── iframe-style match list container ── */}
          <div style={{
            border: `1px solid rgba(201,162,39,0.15)`,
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.4)',
            background: C.bg1,
          }}>
            {/* iframe title bar */}
            <div style={{
              padding: '11px 18px',
              background: 'linear-gradient(135deg, #0f1e35, #0a1628)',
              borderBottom: `1px solid rgba(201,162,39,0.1)`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(239,68,68,0.6)' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,165,0,0.5)' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(34,197,94,0.5)' }} />
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.dim, letterSpacing: '0.06em', marginLeft: 6 }}>
                match-list · {matches.length} records
              </p>
            </div>

            {/* Scrollable content */}
            <div style={{
              maxHeight: 'calc(100vh - 220px)',
              overflowY: 'auto',
              padding: '16px 16px 8px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(201,162,39,0.25) transparent',
            }}>
              {matches.length === 0 ? (
                <div style={{ padding:'40px 24px', textAlign:'center' }}>
                  <p style={{ fontSize:14, color:C.muted, marginBottom:8 }}>No matches yet</p>
                  <Link href="/admin/schedule" style={{ fontSize:13, color:C.gold, textDecoration:'none', fontWeight:600 }}>Generate schedule →</Link>
                </div>
              ) : (
                sections.map(sec => (
                  <div key={sec.title} style={{ marginBottom: 24 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, paddingBottom:8, borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
                      <p style={{ fontSize:10, fontWeight:700, color:C.gold, letterSpacing:'0.14em', textTransform:'uppercase' }}>{sec.title}</p>
                      <span style={{ fontSize:10, color:C.dim, fontWeight:600, padding:'2px 7px', borderRadius:4, background:'rgba(255,255,255,0.04)', border:`1px solid ${C.border}` }}>{sec.matches.length}</span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                      {sec.matches.map(m => {
                        const st = STATUS[m.status] || STATUS.scheduled;
                        const isEditing = panel && panel._id === m._id;
                        return (
                          <div key={m._id} style={{
                            background: isEditing ? 'rgba(201,162,39,0.05)' : 'rgba(255,255,255,0.02)',
                            border:`1px solid ${isEditing ? 'rgba(201,162,39,0.25)' : 'rgba(255,255,255,0.05)'}`,
                            borderRadius:9, padding:'12px 14px',
                            display:'flex', alignItems:'center', gap:12, flexWrap:'wrap',
                            transition:'border-color .2s, background .2s',
                          }}
                            onMouseEnter={e => { if (!isEditing) { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; }}}
                            onMouseLeave={e => { if (!isEditing) { e.currentTarget.style.background='rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.05)'; }}}
                          >
                            <div style={{ flex:1, minWidth:160 }}>
                              <p style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:2 }}>
                                <span style={{ color: C.text }}>{m.teamA?.name}</span>
                                <span style={{ color:C.dim, fontWeight:400, margin:'0 6px' }}>vs</span>
                                <span style={{ color: C.text }}>{m.teamB?.name}</span>
                              </p>
                              <p style={{ fontSize:11, color:C.dim }}>
                                {m.ground} · {m.stage==='group'?`Round ${m.round}`:m.group} · {m.overs} ov
                                {m.tossWinner && <span style={{ color:'rgba(201,162,39,0.6)' }}> · {m.tossWinner.name} won toss</span>}
                              </p>
                            </div>
                            <span style={{ fontSize:9, fontWeight:800, color:st.color, padding:'3px 8px', borderRadius:4, background:st.bg, border:`1px solid ${st.border}`, letterSpacing:'0.1em', flexShrink:0 }}>
                              {st.label}
                            </span>
                            <div style={{ display:'flex', gap:5, flexWrap:'wrap', flexShrink:0 }}>
                              {m.status==='scheduled' && (
                                <>
                                  <Btn onClick={() => openToss(m)} variant="gold-outline">{m.tossWinner ? 'Toss ✓' : 'Set Toss'}</Btn>
                                  <Btn onClick={() => setStatus(m._id,'live')} variant="red">Go Live</Btn>
                                  <Btn onClick={() => openEdit(m)} variant="ghost">Edit</Btn>
                                </>
                              )}
                              {m.status==='live' && (
                                <Link href={`/admin/matches/${m._id}/score`} style={{ padding:'6px 12px', borderRadius:7, background:`linear-gradient(135deg,#d4a82a,${C.gold})`, color:C.bg0, textDecoration:'none', fontWeight:700, fontSize:12, display:'inline-flex', alignItems:'center', gap:5 }}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                                  Score
                                </Link>
                              )}
                              {m.status!=='completed' && (
                                <Link href={`/admin/matches/${m._id}/complete`} style={{ padding:'6px 12px', borderRadius:7, background:'rgba(255,255,255,0.04)', color:C.muted, textDecoration:'none', fontWeight:600, fontSize:12, border:`1px solid ${C.border}` }}>Complete</Link>
                              )}
                              {m.status!=='scheduled' && (
                                <Btn onClick={() => setStatus(m._id,'scheduled')} variant="ghost">Reset</Btn>
                              )}
                              <Link href={`/admin/matches/${m._id}/summary`} style={{ padding:'6px 12px', borderRadius:7, background:C.goldDim, color:C.gold, textDecoration:'none', fontWeight:700, fontSize:12, border:`1px solid rgba(201,162,39,0.25)`, display:'inline-flex', alignItems:'center', gap:4 }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                Summary
                              </Link>
                              <Btn onClick={() => setDeleteId(m._id)} variant="danger">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                              </Btn>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — sticky form panel (iframe style) */}
        {panel && (
          <div className="matches-right-panel" style={{
            width: 360, flexShrink: 0,
            padding: '20px 16px',
            overflowY: 'auto',
            background: 'transparent',
          }}>
            <div style={{
              background: '#0a1628',
              border: '1px solid rgba(201,162,39,0.18)',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 24px 48px rgba(0,0,0,0.5), 0 0 80px rgba(201,162,39,0.04)',
              position: 'sticky',
              top: 0,
            }}>
              {/* Panel title bar */}
              <div style={{
                padding: '14px 18px',
                background: 'linear-gradient(135deg, #0f1e35, #0a1628)',
                borderBottom: '1px solid rgba(201,162,39,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c9a227', boxShadow: '0 0 8px rgba(201,162,39,0.6)' }} />
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#e8e8e8', letterSpacing: '-0.01em' }}>
                    {panel === 'create' ? 'New Match' : 'Edit Match'}
                  </p>
                </div>
                <button onClick={() => setPanel(null)} style={{
                  width: 26, height: 26, borderRadius: 7, border: 'none',
                  background: 'rgba(255,255,255,0.05)', color: '#4a6a82',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#4a6a82'; }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {/* Form body */}
              <div style={{ padding: '20px 18px' }}>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* Team A */}
                  <Field label="Team A">
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {teams.length === 0 ? (
                        <p style={{ fontSize:12, color:C.dim, padding:'10px 0' }}>No teams found</p>
                      ) : teams.map(t => (
                        <button key={t._id} type="button" onClick={() => setForm({...form, teamA: t._id})} style={{
                          padding:'10px 14px', borderRadius:8, border:`1px solid ${form.teamA===t._id ? C.gold : C.border}`,
                          background: form.teamA===t._id ? 'rgba(201,162,39,0.1)' : 'rgba(255,255,255,0.02)',
                          color: form.teamA===t._id ? C.gold : C.muted,
                          cursor:'pointer', fontWeight: form.teamA===t._id ? 700 : 500,
                          fontSize:13, fontFamily:'inherit', textAlign:'left',
                          display:'flex', alignItems:'center', justifyContent:'space-between',
                          transition:'all .15s',
                        }}>
                          <span>{t.name}</span>
                          <span style={{ fontSize:10, opacity:0.6 }}>Grp {t.group}</span>
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Team B */}
                  <Field label="Team B">
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {teams.length === 0 ? (
                        <p style={{ fontSize:12, color:C.dim, padding:'10px 0' }}>No teams found</p>
                      ) : teams.map(t => (
                        <button key={t._id} type="button" onClick={() => setForm({...form, teamB: t._id})} style={{
                          padding:'10px 14px', borderRadius:8, border:`1px solid ${form.teamB===t._id ? '#60a5fa' : C.border}`,
                          background: form.teamB===t._id ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.02)',
                          color: form.teamB===t._id ? '#60a5fa' : C.muted,
                          cursor:'pointer', fontWeight: form.teamB===t._id ? 700 : 500,
                          fontSize:13, fontFamily:'inherit', textAlign:'left',
                          display:'flex', alignItems:'center', justifyContent:'space-between',
                          transition:'all .15s',
                          opacity: form.teamA === t._id ? 0.3 : 1,
                        }} disabled={form.teamA === t._id}>
                          <span>{t.name}</span>
                          <span style={{ fontSize:10, opacity:0.6 }}>Grp {t.group}</span>
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Stage + Group */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Field label="Stage">
                      <select value={form.stage} onChange={e => {
                        const s = e.target.value;
                        setForm({...form, stage: s, group: s==='group'?'A': s==='semi'?'Semi Final 1':'Final'});
                      }} style={sel}>
                        <option value="group">Group</option>
                        <option value="semi">Semi Final</option>
                        <option value="final">Final</option>
                      </select>
                    </Field>
                    <Field label={form.stage==='group'?'Group':form.stage==='semi'?'Semi':'Match'}>
                      {form.stage==='group' ? (
                        <select value={form.group} onChange={e => setForm({...form, group: e.target.value})} style={sel}>
                          <option value="A">Group A</option>
                          <option value="B">Group B</option>
                        </select>
                      ) : form.stage==='semi' ? (
                        <select value={form.group} onChange={e => setForm({...form, group: e.target.value})} style={sel}>
                          <option value="Semi Final 1">SF 1</option>
                          <option value="Semi Final 2">SF 2</option>
                        </select>
                      ) : (
                        <input value="Final" disabled style={{...sel, color: C.dim, cursor: 'default'}} />
                      )}
                    </Field>
                  </div>

                  {/* Overs + Time */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Field label="Overs">
                      <input type="number" min="1" max="50" value={form.overs} onChange={e => setForm({...form, overs: Number(e.target.value)})} style={{...sel, cursor: 'text'}} />
                    </Field>
                    <Field label="Match Time">
                      <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} style={{...sel, cursor: 'text'}} />
                    </Field>
                  </div>

                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '2px 0' }} />

                  <button type="submit" disabled={saving || !form.teamA || !form.teamB} style={{
                    padding: '12px', borderRadius: 9, border: 'none',
                    cursor: (saving || !form.teamA || !form.teamB) ? 'not-allowed' : 'pointer',
                    background: (saving || !form.teamA || !form.teamB) ? 'rgba(201,162,39,0.4)' : 'linear-gradient(135deg,#d4a82a,#c9a227)',
                    color: '#060e1a', fontWeight: 800, fontSize: 13, fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    boxShadow: saving ? 'none' : '0 4px 16px rgba(201,162,39,0.2)',
                  }}>
                    {saving && <div style={{ width: 13, height: 13, border: '2px solid rgba(6,14,26,0.25)', borderTopColor: '#060e1a', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />}
                    {saving ? 'Saving…' : panel === 'create' ? 'Create Match' : 'Update Match'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile form modal (shown when panel is open on small screens) ── */}
      {panel && (
        <div className="md:hidden" style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(6px)', display:'flex', alignItems:'flex-end', justifyContent:'center', zIndex:55 }}>
          <div style={{ background:'#0a1628', border:'1px solid rgba(201,162,39,0.18)', borderRadius:'16px 16px 0 0', width:'100%', maxHeight:'85vh', overflowY:'auto', padding:'20px 16px 32px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <p style={{ fontSize:15, fontWeight:800, color:'#e8e8e8' }}>{panel === 'create' ? 'New Match' : 'Edit Match'}</p>
              <button onClick={() => setPanel(null)} style={{ width:28, height:28, borderRadius:8, border:'none', background:'rgba(255,255,255,0.06)', color:'#8b9db7', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:14 }}>

              {/* Team A */}
              <Field label="Team A">
                <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:200, overflowY:'auto' }}>
                  {teams.map(t => (
                    <button key={t._id} type="button" onClick={() => setForm({...form, teamA: t._id})} style={{
                      padding:'10px 12px', borderRadius:8, border:`1px solid ${form.teamA===t._id ? C.gold : C.border}`,
                      background: form.teamA===t._id ? 'rgba(201,162,39,0.1)' : 'rgba(255,255,255,0.02)',
                      color: form.teamA===t._id ? C.gold : C.muted,
                      cursor:'pointer', fontWeight: form.teamA===t._id ? 700 : 500,
                      fontSize:13, fontFamily:'inherit', textAlign:'left',
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                    }}>
                      <span>{t.name}</span>
                      <span style={{ fontSize:10, opacity:0.6 }}>Grp {t.group}</span>
                    </button>
                  ))}
                </div>
              </Field>

              {/* Team B */}
              <Field label="Team B">
                <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:200, overflowY:'auto' }}>
                  {teams.map(t => (
                    <button key={t._id} type="button" onClick={() => setForm({...form, teamB: t._id})} style={{
                      padding:'10px 12px', borderRadius:8, border:`1px solid ${form.teamB===t._id ? '#60a5fa' : C.border}`,
                      background: form.teamB===t._id ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.02)',
                      color: form.teamB===t._id ? '#60a5fa' : C.muted,
                      cursor:'pointer', fontWeight: form.teamB===t._id ? 700 : 500,
                      fontSize:13, fontFamily:'inherit', textAlign:'left',
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      opacity: form.teamA === t._id ? 0.3 : 1,
                    }} disabled={form.teamA === t._id}>
                      <span>{t.name}</span>
                      <span style={{ fontSize:10, opacity:0.6 }}>Grp {t.group}</span>
                    </button>
                  ))}
                </div>
              </Field>

              {/* Stage + Group */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <Field label="Stage">
                  <select value={form.stage} onChange={e => { const s=e.target.value; setForm({...form, stage:s, group:s==='group'?'A':s==='semi'?'Semi Final 1':'Final'}); }} style={sel}>
                    <option value="group">Group</option>
                    <option value="semi">Semi Final</option>
                    <option value="final">Final</option>
                  </select>
                </Field>
                <Field label={form.stage==='group'?'Group':form.stage==='semi'?'Semi':'Match'}>
                  {form.stage==='group' ? (
                    <select value={form.group} onChange={e => setForm({...form, group:e.target.value})} style={sel}>
                      <option value="A">Group A</option>
                      <option value="B">Group B</option>
                    </select>
                  ) : form.stage==='semi' ? (
                    <select value={form.group} onChange={e => setForm({...form, group:e.target.value})} style={sel}>
                      <option value="Semi Final 1">SF 1</option>
                      <option value="Semi Final 2">SF 2</option>
                    </select>
                  ) : (
                    <input value="Final" disabled style={{...sel, color:C.dim, cursor:'default'}} />
                  )}
                </Field>
              </div>

              {/* Overs + Time */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <Field label="Overs">
                  <input type="number" min="1" max="50" value={form.overs} onChange={e => setForm({...form, overs:Number(e.target.value)})} style={{...sel, cursor:'text'}} />
                </Field>
                <Field label="Match Time">
                  <input type="time" value={form.time} onChange={e => setForm({...form, time:e.target.value})} style={{...sel, cursor:'text'}} />
                </Field>
              </div>

              <button type="submit" disabled={saving || !form.teamA || !form.teamB} style={{
                padding:'13px', borderRadius:9, border:'none', cursor:(saving || !form.teamA || !form.teamB)?'not-allowed':'pointer',
                background:(saving || !form.teamA || !form.teamB)?'rgba(201,162,39,0.4)':'linear-gradient(135deg,#d4a82a,#c9a227)',
                color:'#060e1a', fontWeight:800, fontSize:14, fontFamily:'inherit',
                display:'flex', alignItems:'center', justifyContent:'center', gap:7,
              }}>
                {saving && <div style={{ width:13, height:13, border:'2px solid rgba(6,14,26,0.25)', borderTopColor:'#060e1a', borderRadius:'50%', animation:'spin .7s linear infinite' }} />}
                {saving ? 'Saving…' : panel === 'create' ? 'Create Match' : 'Update Match'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}

function Btn({ onClick, children, variant='ghost' }) {
  const styles = {
    ghost:        { bg:'rgba(255,255,255,0.04)', color:'#8b9db7', border:'1px solid rgba(255,255,255,0.07)' },
    'gold-outline':{ bg:'rgba(201,162,39,0.08)', color:'#c9a227', border:'1px solid rgba(201,162,39,0.25)' },
    red:          { bg:'rgba(239,68,68,0.1)',    color:'#ef4444', border:'1px solid rgba(239,68,68,0.25)'  },
    danger:       { bg:'transparent',            color:'#4a6a82', border:'1px solid rgba(255,255,255,0.07)' },
  };
  const s = styles[variant] || styles.ghost;
  return (
    <button onClick={onClick} style={{
      padding:'6px 12px', borderRadius:7, border:s.border, cursor:'pointer',
      background:s.bg, color:s.color, fontWeight:600, fontSize:12,
      fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:5,
      transition:'all .15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.opacity='0.8'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity='1'; }}
    >{children}</button>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p style={{ fontSize:10, fontWeight:700, color:'#4a6a82', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:7 }}>{label}</p>
      {children}
    </div>
  );
}
