'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { DISMISSAL_TYPES } from '@/constants/cricket';
import {
  calcRunRate, ballsLeft, oversDisplay,
  ballLabel, ballStyle, buildCommentary, playerId,
} from '@/utils/cricket';

/* ─── design tokens (dark-only admin panel) ─────────────────────────────── */
const C = {
  bg0:    '#060e1a',
  bg1:    '#0a1628',
  bg2:    '#0f1e35',
  bg3:    '#152540',
  border: 'rgba(255,255,255,0.07)',
  gold:   '#c9a227',
  goldDim:'rgba(201,162,39,0.15)',
  red:    '#ef4444',
  redDim: 'rgba(239,68,68,0.12)',
  orange: '#f97316',
  green:  '#22c55e',
  blue:   '#60a5fa',
  text:   '#e8e8e8',
  muted:  '#8b9db7',
  dim:    '#4a6a82',
};

const Btn = ({ onClick, children, variant = 'default', size = 'md', style: extra = {} }) => {
  const base = {
    border: 'none', cursor: 'pointer', fontWeight: 800,
    borderRadius: 10, transition: 'all .15s', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  };
  const sizes = { sm: { height: 40, fontSize: 12 }, md: { height: 52, fontSize: 14 }, lg: { height: 60, fontSize: 18 } };
  const variants = {
    default: { background: C.bg2, color: C.text, outline: `1px solid ${C.border}` },
    gold:    { background: `linear-gradient(135deg,#d4a82a,${C.gold})`, color: C.bg0, boxShadow: '0 4px 16px rgba(201,162,39,0.25)' },
    red:     { background: C.redDim, color: C.red, outline: `1px solid rgba(239,68,68,0.3)` },
    orange:  { background: 'rgba(249,115,22,0.12)', color: C.orange, outline: '1px solid rgba(249,115,22,0.3)' },
    ghost:   { background: 'rgba(255,255,255,0.04)', color: C.muted, outline: `1px solid ${C.border}` },
    four:    { background: 'rgba(96,165,250,0.12)', color: C.blue, outline: '1px solid rgba(96,165,250,0.3)' },
    six:     { background: 'rgba(201,162,39,0.15)', color: C.gold, outline: `1px solid rgba(201,162,39,0.35)` },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...sizes[size], ...variants[variant], ...extra }}>
      {children}
    </button>
  );
};

const Label = ({ children }) => (
  <p style={{ fontSize: 10, fontWeight: 700, color: C.dim, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
    {children}
  </p>
);

const Panel = ({ children, style = {} }) => (
  <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', ...style }}>
    {children}
  </div>
);

const Select = ({ value, onChange, children }) => (
  <select value={value} onChange={onChange} style={{
    width: '100%', padding: '10px 14px', borderRadius: 9,
    background: C.bg0, border: `1px solid ${C.border}`,
    color: value ? C.text : C.dim, fontSize: 13, fontWeight: 600,
    outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
    transition: 'border-color .2s',
  }}
    onFocus={e => e.target.style.borderColor = 'rgba(201,162,39,0.4)'}
    onBlur={e => e.target.style.borderColor = C.border}
  >
    {children}
  </select>
);

export default function ScorePage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [match, setMatch] = useState(null);
  const [inningsNum, setInningsNum] = useState(1);
  const [players, setPlayers] = useState([]);
  const [strikerId, setStrikerId] = useState('');
  const [nonStrikerId, setNonStrikerId] = useState('');
  const [bowlerId, setBowlerId] = useState('');
  const strikerRef = useRef('');
  const nonStrikerRef = useRef('');
  const bowlerRef = useRef('');
  const inningsNumRef = useRef(1);
  const submittingRef = useRef(false);
  const syncRefs = useCallback((s, ns, b, inn) => {
    strikerRef.current = s; nonStrikerRef.current = ns;
    bowlerRef.current = b; inningsNumRef.current = inn;
  }, []);
  const [wicketModal, setWicketModal] = useState(false);
  const [wicketType, setWicketType] = useState('bowled');
  const [pendingRuns, setPendingRuns] = useState(0);
  const [pendingExtras, setPendingExtras] = useState('');
  const [extrasModal, setExtrasModal] = useState(false);
  const [extrasType, setExtrasType] = useState('');
  const [extrasRuns, setExtrasRuns] = useState(0);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
    else if (!loading && user) loadMatch();
  }, [loading, user, id]);

  const showMsg = (text, type = 'info', duration = 2500) => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), duration);
  };

  const applyInningsPlayers = (innings, num) => {
    let s = '', ns = '', b = '';
    if (innings?.currentBatsmen?.length > 0) {
      const sk = innings.currentBatsmen.find(bm => bm.isStriker);
      const nsk = innings.currentBatsmen.find(bm => !bm.isStriker);
      s = playerId(sk?.player); ns = playerId(nsk?.player);
    }
    if (innings?.currentBowler?.player) b = playerId(innings.currentBowler.player);
    setStrikerId(s); setNonStrikerId(ns); setBowlerId(b);
    syncRefs(s, ns, b, num);
  };

  const loadMatch = async () => {
    const d = await api.get(`/matches/${id}`);
    if (d._id) {
      setMatch(d);
      const num = d.currentInnings || 1;
      setInningsNum(num);
      const [ap, bp] = await Promise.all([
        api.get(`/players/team/${d.teamA._id}`),
        api.get(`/players/team/${d.teamB._id}`),
      ]);
      setPlayers([...(Array.isArray(ap) ? ap : []), ...(Array.isArray(bp) ? bp : [])]);
      applyInningsPlayers(num === 1 ? d.innings1 : d.innings2, num);
    }
  };

  const handleInningsSwitch = (num) => {
    setInningsNum(num); inningsNumRef.current = num;
    applyInningsPlayers(num === 1 ? match?.innings1 : match?.innings2, num);
  };

  const handleSetPlayers = useCallback(async (os, ons, ob, oi) => {
    const s = os ?? strikerRef.current, ns = ons ?? nonStrikerRef.current;
    const b = ob ?? bowlerRef.current, inn = oi ?? inningsNumRef.current;
    if (!s || !ns || !b) return;
    const res = await api.put(`/matches/${id}/players`, { inningsNum: inn, strikerId: s, nonStrikerId: ns, bowlerId: b });
    if (res._id) {
      setMatch(res);
      // Sync striker/nonStriker IDs from backend response to keep stats in sync
      const ui = inn === 1 ? res.innings1 : res.innings2;
      if (ui?.currentBatsmen?.length > 0) {
        const sk  = ui.currentBatsmen.find(bm => bm.isStriker);
        const nsk = ui.currentBatsmen.find(bm => !bm.isStriker);
        const skId  = sk?.player  ? (typeof sk.player  === 'object' ? sk.player._id  : sk.player)  : s;
        const nskId = nsk?.player ? (typeof nsk.player === 'object' ? nsk.player._id : nsk.player) : ns;
        setStrikerId(skId);    strikerRef.current    = skId;
        setNonStrikerId(nskId); nonStrikerRef.current = nskId;
      }
      showMsg('Players updated', 'success');
    }
  }, [id]);

  const submitBall = useCallback(async ({ runs = 0, isWicket = false, dismissalType = '', extras = '', extraRuns = 0 }) => {
    const s = strikerRef.current, ns = nonStrikerRef.current;
    const b = bowlerRef.current, inn = inningsNumRef.current;
    if (!s || !ns || !b) { showMsg('Select all players first', 'error'); return; }
    if (submittingRef.current) return;
    submittingRef.current = true;
    const res = await api.post(`/matches/${id}/ball`, {
      inningsNum: inn, runs, isWicket, dismissalType, extras, extraRuns,
      batsmanId: s, bowlerId: b, strikerId: s, nonStrikerId: ns,
      commentary: buildCommentary(runs, isWicket, dismissalType, extras, extraRuns),
    });
    submittingRef.current = false;
    if (res._id) {
      setMatch(res);
      const ui = inn === 1 ? res.innings1 : res.innings2;
      let ns2 = s, nns2 = ns, nb2 = b;
      if (ui?.currentBatsmen?.length > 0) {
        const sk = ui.currentBatsmen.find(bm => bm.isStriker);
        const nsk = ui.currentBatsmen.find(bm => !bm.isStriker);
        ns2 = sk?.player ? (typeof sk.player === 'object' ? sk.player._id : sk.player) : s;
        nns2 = nsk?.player ? (typeof nsk.player === 'object' ? nsk.player._id : nsk.player) : ns;
      }
      if (!ui?.currentBowler?.player) {
        nb2 = ''; setBowlerId(''); bowlerRef.current = '';
        showMsg('Over complete — select new bowler', 'info', 4000);
      }
      setStrikerId(ns2); setNonStrikerId(nns2);
      strikerRef.current = ns2; nonStrikerRef.current = nns2;
      if (isWicket) { setStrikerId(''); strikerRef.current = ''; showMsg('Wicket! Select new batsman', 'error', 3000); }
      else if (ui?.currentBowler?.player) showMsg(extras ? extras.toUpperCase() : `${runs} run${runs !== 1 ? 's' : ''}`, 'success');
    } else showMsg(res.message || 'Error recording ball', 'error');
  }, [id]);

  const handleUndo = async () => {
    const res = await api.post(`/matches/${id}/undo`, { inningsNum: inningsNumRef.current });
    if (res._id) { setMatch(res); applyInningsPlayers(inningsNumRef.current === 1 ? res.innings1 : res.innings2, inningsNumRef.current); showMsg('Last ball undone', 'info'); }
    else showMsg(res.message || 'Nothing to undo', 'error');
  };

  const handleSwap = async () => {
    const s = strikerRef.current, ns = nonStrikerRef.current;
    if (!s || !ns) return;
    setStrikerId(ns); setNonStrikerId(s);
    strikerRef.current = ns; nonStrikerRef.current = s;
    await handleSetPlayers(ns, s, bowlerRef.current, inningsNumRef.current);
  };

  const openWicket = (runs = 0, extras = '') => { setPendingRuns(runs); setPendingExtras(extras); setWicketType('bowled'); setWicketModal(true); };
  const confirmWicket = () => { setWicketModal(false); submitBall({ runs: pendingRuns, isWicket: true, dismissalType: wicketType, extras: pendingExtras }); };
  const openExtrasModal = (type) => { setExtrasType(type); setExtrasRuns(0); setExtrasModal(true); };
  const confirmExtras = () => { setExtrasModal(false); submitBall({ runs: extrasRuns, extras: extrasType }); };

  if (!match) return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: 32, height: 32, border: `2px solid ${C.goldDim}`, borderTopColor: C.gold, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    </AdminLayout>
  );

  const TOTAL_OVERS = match.overs || 6;
  const battingTeam = inningsNum === 1 ? match.teamA : match.teamB;
  const bowlingTeam = inningsNum === 1 ? match.teamB : match.teamA;
  const innings = inningsNum === 1 ? match.innings1 : match.innings2;
  const battingPlayers = players.filter(p => p.team === battingTeam._id || p.team?._id === battingTeam._id);
  const bowlingPlayers = players.filter(p => p.team === bowlingTeam._id || p.team?._id === bowlingTeam._id);
  const striker = innings?.currentBatsmen?.find(b => b.isStriker);
  const nonStriker = innings?.currentBatsmen?.find(b => !b.isStriker);
  const currentBowler = innings?.currentBowler;
  const currentOverBalls = (innings?.ballByBall || []).filter(b => b.over === (innings?.overs || 0));

  return (
    <AdminLayout>
      {/* Full-width wrapper — no maxWidth, fills the main area */}
      <div style={{ padding: '20px 24px', height: '100%', display: 'flex', flexDirection: 'column', gap: 14, boxSizing: 'border-box' }}>

        {/* ── Top bar: header + innings tabs + toast ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: C.redDim, border: '1px solid rgba(239,68,68,0.3)', marginBottom: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, display: 'inline-block', boxShadow: `0 0 6px ${C.red}`, animation: 'pulse 1.5s ease-in-out infinite' }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: C.red, letterSpacing: '0.12em' }}>LIVE SCORING</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, letterSpacing: '-0.01em', marginBottom: 2, fontFamily: 'var(--font-bebas)', textTransform: 'uppercase' }}>
              {match.teamA?.name} <span style={{ color: C.gold }}>vs</span> {match.teamB?.name}
            </h1>
            <p style={{ fontSize: 11, color: C.dim, fontWeight: 600 }}>{match.group} · {match.ground}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {[1, 2].map(n => (
              <button key={n} onClick={() => handleInningsSwitch(n)} style={{
                padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 12, fontFamily: 'inherit', transition: 'all .2s',
                background: inningsNum === n ? `linear-gradient(135deg,#d4a82a,${C.gold})` : C.bg2,
                color: inningsNum === n ? C.bg0 : C.muted,
                boxShadow: inningsNum === n ? '0 4px 16px rgba(201,162,39,0.2)' : 'none',
                outline: inningsNum !== n ? `1px solid ${C.border}` : 'none',
              }}>
                Inn {n} — {n === 1 ? match.teamA?.name : match.teamB?.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Toast ── */}
        {msg && (
          <div style={{
            padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: msgType === 'error' ? C.redDim : msgType === 'success' ? 'rgba(34,197,94,0.1)' : C.goldDim,
            color: msgType === 'error' ? C.red : msgType === 'success' ? C.green : C.gold,
            border: `1px solid ${msgType === 'error' ? 'rgba(239,68,68,0.3)' : msgType === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(201,162,39,0.3)'}`,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {msgType === 'error' ? <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></> : <><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></>}
            </svg>
            {msg}
          </div>
        )}

        {/* ── Two-column body ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, flex: 1, minHeight: 0 }}>

          {/* LEFT column — scoreboard + players */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>

        {/* ── Live Scoreboard ── */}
        <Panel style={{ padding: 0, overflow: 'hidden' }}>
          {/* Score hero */}
          <div style={{ padding: '20px 24px', background: `linear-gradient(135deg, ${C.bg2}, ${C.bg1})`, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: C.dim, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>Batting</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{battingTeam?.name}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 48, fontWeight: 900, color: C.text, lineHeight: 1, fontFamily: 'var(--font-bebas)', letterSpacing: '-0.02em' }}>
                  {innings?.runs || 0}
                  <span style={{ color: C.red, fontSize: 32 }}>/{innings?.wickets || 0}</span>
                </p>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 2, fontWeight: 600 }}>
                  {oversDisplay(innings?.overs || 0, innings?.balls || 0)} / {TOTAL_OVERS}.0 ov
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: C.dim, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>Bowling</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{bowlingTeam?.name}</p>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', background: C.bg0 }}>
            {[
              { l: 'Balls Left', v: ballsLeft(TOTAL_OVERS, innings?.overs || 0, innings?.balls || 0), c: C.gold },
              { l: 'Run Rate',   v: calcRunRate(innings?.runs || 0, innings?.overs || 0, innings?.balls || 0), c: C.text },
              { l: 'Extras',    v: innings?.extras || 0, c: C.muted },
            ].map((s, i) => (
              <div key={s.l} style={{ padding: '12px 8px', textAlign: 'center', borderRight: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                <p style={{ fontSize: 9, color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>{s.l}</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: s.c, fontFamily: 'var(--font-bebas)', lineHeight: 1 }}>{s.v}</p>
              </div>
            ))}
          </div>

          {/* This over */}
          {currentOverBalls.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginRight: 4 }}>This Over</p>
              {currentOverBalls.map((ball, i) => (
                <div key={i} style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, fontFamily: 'var(--font-bebas)', ...ballStyle(ball) }}>
                  {ballLabel(ball)}
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* ── Players ── */}
        <Panel>
          <Label>Players at the Crease</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 10, alignItems: 'start', marginBottom: 14 }}>
            {/* Striker */}
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, color: C.gold, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.gold, display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                Striker
              </p>
              <Select value={strikerId} onChange={e => {
                const v = e.target.value; setStrikerId(v); strikerRef.current = v;
                if (v && nonStrikerRef.current && bowlerRef.current) handleSetPlayers(v, nonStrikerRef.current, bowlerRef.current, inningsNumRef.current);
              }}>
                <option value="">Select striker</option>
                {battingPlayers.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </Select>
              {striker ? (
                <p style={{ fontSize: 11, color: C.dim, marginTop: 5, fontWeight: 600 }}>
                  {striker.runs}({striker.balls}) · 4s:{striker.fours} 6s:{striker.sixes}
                </p>
              ) : (
                <p style={{ fontSize: 11, color: C.dim, marginTop: 5, fontStyle: 'italic' }}>Not selected</p>
              )}
            </div>

            {/* Swap */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 22 }}>
              <button onClick={handleSwap} title="Swap strike" style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg,#d4a82a,${C.gold})`, color: C.bg0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 12px rgba(201,162,39,0.35)', transition: 'transform .2s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'rotate(180deg) scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0) scale(1)'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                  <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                </svg>
              </button>
            </div>

            {/* Non-striker */}
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Non-Striker</p>
              <Select value={nonStrikerId} onChange={e => {
                const v = e.target.value; setNonStrikerId(v); nonStrikerRef.current = v;
                if (strikerRef.current && v && bowlerRef.current) handleSetPlayers(strikerRef.current, v, bowlerRef.current, inningsNumRef.current);
              }}>
                <option value="">Select non-striker</option>
                {battingPlayers.filter(p => p._id !== strikerId).map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </Select>
              {nonStriker ? (
                <p style={{ fontSize: 11, color: C.dim, marginTop: 5, fontWeight: 600 }}>
                  {nonStriker.runs}({nonStriker.balls}) · 4s:{nonStriker.fours} 6s:{nonStriker.sixes}
                </p>
              ) : (
                <p style={{ fontSize: 11, color: C.dim, marginTop: 5, fontStyle: 'italic' }}>Not selected</p>
              )}
            </div>
          </div>

          <Label>Current Bowler</Label>
          <Select value={bowlerId} onChange={e => {
            const v = e.target.value; setBowlerId(v); bowlerRef.current = v;
            if (strikerRef.current && nonStrikerRef.current && v) handleSetPlayers(strikerRef.current, nonStrikerRef.current, v, inningsNumRef.current);
          }}>
            <option value="">Select bowler</option>
            {bowlingPlayers.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </Select>
          {currentBowler?.player && (
            <p style={{ fontSize: 11, color: C.dim, marginTop: 6, fontWeight: 600 }}>
              {currentBowler.overs}.{currentBowler.balls} ov · {currentBowler.runs}r / {currentBowler.wickets}w
            </p>
          )}
        </Panel>

          </div>{/* end LEFT column */}

          {/* RIGHT column — scoring buttons */}
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── Scoring Buttons ── */}
        <Panel>
          {/* Runs */}
          <Label>Runs</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 8 }}>
            {[0, 1, 2, 3].map(r => (
              <Btn key={r} onClick={() => submitBall({ runs: r })} size="md">{r}</Btn>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 18 }}>
            <Btn onClick={() => submitBall({ runs: 4 })} variant="four" size="md" style={{ fontSize: 20 }}>4</Btn>
            <Btn onClick={() => submitBall({ runs: 5 })} size="md" style={{ fontSize: 20 }}>5</Btn>
            <Btn onClick={() => submitBall({ runs: 6 })} variant="six" size="md" style={{ fontSize: 20 }}>6</Btn>
          </div>

          {/* Extras */}
          <Label>Extras</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <Btn onClick={() => openExtrasModal('wd')} variant="orange" size="sm">Wide (Wd)</Btn>
            <Btn onClick={() => openExtrasModal('nb')} variant="orange" size="sm">No Ball (NB)</Btn>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 8 }}>
            {[['nb-ff','Front Foot NB'],['nb-2b','2 Bounce NB'],['nb-wh','Waist High NB']].map(([t,l]) => (
              <Btn key={t} onClick={() => openExtrasModal(t)} variant="orange" size="sm" style={{ fontSize: 11 }}>{l}</Btn>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
            <Btn onClick={() => submitBall({ runs: 1, extras: 'b' })} size="sm">Bye</Btn>
            <Btn onClick={() => submitBall({ runs: 1, extras: 'lb' })} size="sm">Leg Bye</Btn>
          </div>

          {/* Overthrow */}
          <Label>Overthrow</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 18 }}>
            {[1,2,3,4].map(ot => (
              <Btn key={ot} onClick={() => submitBall({ runs: ot, extras: `ot${ot}`, extraRuns: ot })} variant="six" size="sm">+{ot}</Btn>
            ))}
          </div>

          {/* Wicket */}
          <Label>Wicket</Label>
          <Btn onClick={() => openWicket(0, '')} variant="red" size="lg" style={{ width: '100%', fontSize: 16, letterSpacing: '0.08em', marginBottom: 18 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            WICKET
          </Btn>

          {/* Admin controls */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
            <Label>Admin Controls</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Btn onClick={handleUndo} variant="ghost" size="sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                Undo Last Ball
              </Btn>
              <Btn onClick={handleSwap} variant="ghost" size="sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                Change Strike
              </Btn>
            </div>
          </div>
        </Panel>

          </div>{/* end RIGHT column */}
        </div>{/* end two-column grid */}

        {/* ── Wicket Modal ── */}
        {wicketModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: C.bg1, border: '1px solid rgba(239,68,68,0.4)', borderRadius: 16, padding: 24, maxWidth: 380, width: '100%', margin: '0 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: C.redDim, border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: C.red }}>Wicket!</p>
                  <p style={{ fontSize: 11, color: C.dim }}>Select dismissal type</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {DISMISSAL_TYPES.map(type => (
                  <button key={type} onClick={() => setWicketType(type)} style={{
                    padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: 12, fontFamily: 'inherit', textTransform: 'capitalize',
                    background: wicketType === type ? C.red : C.bg2,
                    color: wicketType === type ? '#fff' : C.muted,
                    outline: wicketType !== type ? `1px solid ${C.border}` : 'none',
                    transition: 'all .15s',
                  }}>{type}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn onClick={() => setWicketModal(false)} variant="ghost" size="sm" style={{ flex: 1 }}>Cancel</Btn>
                <Btn onClick={confirmWicket} variant="red" size="sm" style={{ flex: 1 }}>Confirm Wicket</Btn>
              </div>
            </div>
          </div>
        )}

        {/* ── Extras Modal ── */}
        {extrasModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: C.bg1, border: '1px solid rgba(249,115,22,0.4)', borderRadius: 16, padding: 24, maxWidth: 360, width: '100%', margin: '0 16px' }}>
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: C.orange, marginBottom: 4 }}>
                  {extrasType === 'wd' ? 'Wide' : extrasType === 'nb' ? 'No Ball' : extrasType === 'nb-ff' ? 'Front Foot No Ball' : extrasType === 'nb-2b' ? '2 Bounce No Ball' : 'Waist High Full Toss NB'}
                </p>
                <p style={{ fontSize: 12, color: C.dim }}>+1 penalty added automatically. Select additional runs:</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
                {[0,1,2,3,4,5,6].map(r => (
                  <button key={r} onClick={() => setExtrasRuns(r)} style={{
                    padding: '10px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
                    fontWeight: 800, fontSize: 14, fontFamily: 'inherit',
                    background: extrasRuns === r ? C.orange : C.bg2,
                    color: extrasRuns === r ? C.bg0 : C.text,
                    outline: extrasRuns !== r ? `1px solid ${C.border}` : 'none',
                    transition: 'all .15s',
                  }}>{r}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn onClick={() => setExtrasModal(false)} variant="ghost" size="sm" style={{ flex: 1 }}>Cancel</Btn>
                <Btn onClick={confirmExtras} variant="orange" size="sm" style={{ flex: 1 }}>Confirm</Btn>
              </div>
            </div>
          </div>
        )}

      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </AdminLayout>
  );
}
