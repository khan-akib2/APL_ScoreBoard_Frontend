'use client';
import { useEffect, useState, useMemo } from 'react';
import UserLayout from '@/components/UserLayout';
import { api } from '@/services/api';
import { oversDisplay } from '@/utils/cricket';

const STAGE_LABELS = { group: 'Group Stage', semi: 'Semi Final', final: 'Final' };

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Scorecard row ─────────────────────────────────────────────────────────────
function BatsmanRow({ b }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <td style={{ padding: '7px 12px', fontSize: 13, color: 'var(--text-primary)', fontWeight: b.status === 'not out' ? 700 : 400 }}>
        {b.player?.name || '—'}
        {b.status === 'not out' && <span style={{ color: 'var(--green)', fontSize: 10, marginLeft: 5 }}>*</span>}
      </td>
      <td style={{ padding: '7px 8px', fontSize: 11, color: 'var(--text-muted)', maxWidth: 140 }}>{b.dismissal || (b.status === 'not out' ? 'not out' : b.status === 'yet to bat' ? 'did not bat' : '—')}</td>
      <td style={{ padding: '7px 8px', textAlign: 'right', fontSize: 14, fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-bebas)' }}>{b.runs ?? 0}</td>
      <td style={{ padding: '7px 8px', textAlign: 'right', fontSize: 13, color: 'var(--text-muted)' }}>{b.balls ?? 0}</td>
      <td style={{ padding: '7px 8px', textAlign: 'right', fontSize: 13, color: '#60a5fa' }}>{b.fours ?? 0}</td>
      <td style={{ padding: '7px 8px', textAlign: 'right', fontSize: 13, color: 'var(--gold)' }}>{b.sixes ?? 0}</td>
      <td style={{ padding: '7px 8px', textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(0) : '—'}</td>
    </tr>
  );
}

function BowlerRow({ b }) {
  const totalBalls = (b.overs || 0) * 6 + (b.balls || 0);
  const eco = totalBalls > 0 ? ((b.runs / totalBalls) * 6).toFixed(1) : '—';
  return (
    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <td style={{ padding: '7px 12px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{b.player?.name || '—'}</td>
      <td style={{ padding: '7px 8px', textAlign: 'right', fontSize: 13, color: 'var(--text-muted)' }}>{oversDisplay(b.overs || 0, b.balls || 0)}</td>
      <td style={{ padding: '7px 8px', textAlign: 'right', fontSize: 13, color: 'var(--text-muted)' }}>{b.runs ?? 0}</td>
      <td style={{ padding: '7px 8px', textAlign: 'right', fontSize: 14, fontWeight: 900, color: 'var(--red)', fontFamily: 'var(--font-bebas)' }}>{b.wickets ?? 0}</td>
      <td style={{ padding: '7px 8px', textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>{eco}</td>
    </tr>
  );
}

const theadStyle = { fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '6px 8px', textAlign: 'right' };
const theadLeft  = { ...theadStyle, textAlign: 'left' };

function InningsCard({ innings, teamName, label }) {
  if (!innings) return null;
  const batters = (innings.batting || []).filter(b => b.player);
  const bowlers = (innings.bowling || []).filter(b => b.player);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label} — {teamName}</p>
        <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-bebas)' }}>
          {innings.runs ?? 0}<span style={{ color: 'var(--red)', fontSize: 14 }}>/{innings.wickets ?? 0}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'inherit', fontWeight: 600, marginLeft: 6 }}>
            ({oversDisplay(innings.overs || 0, innings.balls || 0)} ov)
          </span>
        </p>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--border-subtle)', marginBottom: 10 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--bg-elevated)' }}>
            <tr>
              <th style={theadLeft}>Batsman</th>
              <th style={theadLeft}>Dismissal</th>
              <th style={theadStyle}>R</th>
              <th style={theadStyle}>B</th>
              <th style={theadStyle}>4s</th>
              <th style={theadStyle}>6s</th>
              <th style={theadStyle}>SR</th>
            </tr>
          </thead>
          <tbody>
            {batters.map((b, i) => <BatsmanRow key={i} b={b} />)}
            {batters.length === 0 && <tr><td colSpan={7} style={{ padding: 14, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No scorecard data</td></tr>}
          </tbody>
          <tfoot style={{ background: 'var(--bg-elevated)' }}>
            <tr>
              <td colSpan={2} style={{ padding: '6px 12px', fontSize: 11, color: 'var(--text-muted)' }}>Extras: {innings.extras ?? 0}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-bebas)' }} colSpan={5}>{innings.runs ?? 0}/{innings.wickets ?? 0}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {bowlers.length > 0 && (
        <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg-elevated)' }}>
              <tr>
                <th style={theadLeft}>Bowler</th>
                <th style={theadStyle}>Ov</th>
                <th style={theadStyle}>R</th>
                <th style={theadStyle}>W</th>
                <th style={theadStyle}>Eco</th>
              </tr>
            </thead>
            <tbody>
              {bowlers.map((b, i) => <BowlerRow key={i} b={b} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Match detail modal ────────────────────────────────────────────────────────
function MatchDetail({ match, onClose }) {
  const winnerName = match.result?.winner?.name || '';
  const inn1Team = match.teamA?.name || 'Team A';
  const inn2Team = match.teamB?.name || 'Team B';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)', overflowY: 'auto', padding: '20px 16px' }}>
      <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-default)', borderRadius: 16, width: '100%', maxWidth: 720, position: 'relative' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>{STAGE_LABELS[match.stage] || match.group} · {match.ground}</p>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {inn1Team} <span style={{ color: 'var(--gold)' }}>vs</span> {inn2Team}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{formatDate(match.date)}</p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Result banner */}
        {winnerName && (
          <div style={{ padding: '12px 24px', background: 'rgba(201,162,39,0.08)', borderBottom: '1px solid rgba(201,162,39,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--gold)' }}>{winnerName} won</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{match.result?.description}</p>
            </div>
          </div>
        )}

        {/* Scorecards */}
        <div style={{ padding: '20px 24px' }}>
          <InningsCard innings={match.innings1} teamName={inn1Team} label="1st Innings" />
          <InningsCard innings={match.innings2} teamName={inn2Team} label="2nd Innings" />
          {match.isSuperOver && (
            <>
              <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)', marginBottom: 12, fontSize: 12, fontWeight: 700, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Super Over
              </div>
              <InningsCard innings={match.superOver1} teamName={inn2Team} label="Super Over 1" />
              <InningsCard innings={match.superOver2} teamName={inn1Team} label="Super Over 2" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Match card ────────────────────────────────────────────────────────────────
function HistoryCard({ match, onClick }) {
  const teamA = match.teamA?.name || 'TBA';
  const teamB = match.teamB?.name || 'TBA';
  const winner = match.result?.winner?.name;
  const inn1 = match.innings1;
  const inn2 = match.innings2;

  return (
    <div onClick={onClick} style={{
      padding: '16px 20px', borderRadius: 14,
      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
      cursor: 'pointer', transition: 'all .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {STAGE_LABELS[match.stage] || match.group} · {match.ground}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(match.date)}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: winner === teamA ? 'var(--gold)' : 'var(--text-primary)', marginBottom: 2, textTransform: 'uppercase' }}>{teamA}</p>
          {inn1 && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{inn1.runs ?? 0}/{inn1.wickets ?? 0} ({oversDisplay(inn1.overs || 0, inn1.balls || 0)})</p>}
        </div>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dim)', padding: '4px 10px', borderRadius: 6, background: 'var(--bg-elevated)', flexShrink: 0 }}>VS</div>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: winner === teamB ? 'var(--gold)' : 'var(--text-primary)', marginBottom: 2, textTransform: 'uppercase' }}>{teamB}</p>
          {inn2 && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{inn2.runs ?? 0}/{inn2.wickets ?? 0} ({oversDisplay(inn2.overs || 0, inn2.balls || 0)})</p>}
        </div>
      </div>

      {winner && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 8, background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.15)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>{winner} — {match.result?.description}</p>
        </div>
      )}

      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>View scorecard</p>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-dim)' }}><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [matches, setMatches]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail]     = useState(null);
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    api.get('/matches').then(d => {
      if (Array.isArray(d)) setMatches(d.filter(m => m.status === 'completed').reverse());
      setLoading(false);
    });
  }, []);

  // Fetch full match detail when a card is clicked
  const openDetail = async (match) => {
    setSelected(match._id);
    const full = await api.get(`/matches/${match._id}`);
    if (full._id) setDetail(full);
  };

  const stages = ['all', 'group', 'semi', 'final'];
  const filtered = useMemo(() =>
    filter === 'all' ? matches : matches.filter(m => m.stage === filter),
    [matches, filter]
  );

  const filterStyle = (s) => ({
    padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontWeight: 700, fontSize: 12, fontFamily: 'inherit',
    background: filter === s ? 'var(--gold)' : 'var(--bg-card)',
    color: filter === s ? '#060e1a' : 'var(--text-muted)',
    border: `1px solid ${filter === s ? 'var(--gold)' : 'var(--border-subtle)'}`,
    transition: 'all .2s',
  });

  return (
    <UserLayout>
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '16px 16px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 100, background: 'rgba(201,162,39,0.08)', border: '1px solid var(--border-default)', fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.14em', marginBottom: 14 }}>
              SEASON 8 · 2026
            </div>
            <h1 style={{ fontSize: 'clamp(26px,5vw,42px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>
              Match <span style={{ color: 'var(--gold)' }}>History</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>All completed matches · Click a card to view full scorecard</p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {stages.map(s => (
              <button key={s} onClick={() => setFilter(s)} style={filterStyle(s)}>
                {s === 'all' ? 'All' : STAGE_LABELS[s] || s}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              {filtered.length} match{filtered.length !== 1 ? 'es' : ''}
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 32, height: 32, border: '2px solid var(--border-default)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: 'var(--text-muted)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l9-9"/><path d="M12.5 7.5l4 4"/><path d="M15 6l3-3 3 3-3 3-3-3z"/></svg>
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No matches completed yet</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Completed match history will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(m => (
                <HistoryCard key={m._id} match={m} onClick={() => openDetail(m)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && detail && (
        <MatchDetail match={detail} onClose={() => { setSelected(null); setDetail(null); }} />
      )}
    </UserLayout>
  );
}
