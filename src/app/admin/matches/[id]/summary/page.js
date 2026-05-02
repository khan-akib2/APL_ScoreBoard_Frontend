'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { oversDisplay, economyRate } from '@/utils/cricket';

/* ─── design tokens ──────────────────────────────────────────────────────── */
const C = {
  bg0:     '#060e1a',
  bg1:     '#0a1628',
  bg2:     '#0f1e35',
  border:  'rgba(255,255,255,0.07)',
  gold:    '#c9a227',
  goldDim: 'rgba(201,162,39,0.1)',
  red:     '#ef4444',
  redDim:  'rgba(239,68,68,0.1)',
  green:   '#22c55e',
  blue:    '#60a5fa',
  text:    '#e8e8e8',
  muted:   '#8b9db7',
  dim:     '#4a6a82',
};

/* ─── shared micro-components ────────────────────────────────────────────── */
const Panel = ({ children, style = {} }) => (
  <div style={{
    background: C.bg1,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    overflow: 'hidden',
    ...style,
  }}>
    {children}
  </div>
);

const SectionHead = ({ label }) => (
  <div style={{
    padding: '12px 20px',
    background: C.bg2,
    borderBottom: `1px solid ${C.border}`,
  }}>
    <span style={{
      fontSize: 10,
      fontWeight: 700,
      color: C.gold,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
    }}>
      {label}
    </span>
  </div>
);

/* ─── ball badge helpers ─────────────────────────────────────────────────── */
function getBallBadgeStyle(ball) {
  if (!ball) return { background: 'rgba(255,255,255,0.04)', color: C.dim, border: `1px solid ${C.border}` };
  if (ball.isWicket) return { background: C.redDim, color: C.red, border: '1px solid rgba(239,68,68,0.35)' };
  if (ball.extras === 'wd' || ball.extras?.startsWith('nb')) {
    return { background: 'rgba(249,115,22,0.12)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' };
  }
  if ((ball.runs ?? 0) >= 6) return { background: C.goldDim, color: C.gold, border: 'rgba(201,162,39,0.35)' };
  if ((ball.runs ?? 0) === 4) return { background: 'rgba(96,165,250,0.1)', color: C.blue, border: '1px solid rgba(96,165,250,0.3)' };
  return { background: 'rgba(255,255,255,0.06)', color: C.text, border: `1px solid ${C.border}` };
}

function getBallLabel(ball) {
  if (!ball) return '·';
  if (ball.isWicket) return 'W';
  if (ball.extras === 'wd') return 'Wd';
  if (ball.extras === 'nb' || ball.extras?.startsWith('nb-')) return `NB+${ball.runs ?? 0}`;
  return String(ball.runs ?? 0);
}

/* ─── ScorecardInnings ───────────────────────────────────────────────────── */
function ScorecardInnings({ innings, battingTeamName, bowlingTeamName, totalOvers }) {
  if (!innings) return null;

  const thSt = {
    padding: '10px 12px',
    fontSize: 10,
    fontWeight: 700,
    color: C.muted,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    borderBottom: `1px solid ${C.border}`,
    background: C.bg2,
    whiteSpace: 'nowrap',
  };
  const tdSt = {
    padding: '11px 12px',
    fontSize: 13,
    borderBottom: `1px solid ${C.border}`,
    color: C.muted,
    whiteSpace: 'nowrap',
  };

  const batters = (innings.batting ?? []).filter(b => b.player);
  const bowlers = innings.bowling ?? [];

  /* group ball-by-ball into overs */
  const overMap = {};
  (innings.ballByBall ?? []).forEach(ball => {
    const ov = ball.over ?? 0;
    if (!overMap[ov]) overMap[ov] = { balls: [], bowlerName: '' };
    overMap[ov].balls.push(ball);
    if (!overMap[ov].bowlerName && ball.bowler) {
      const bEntry = bowlers.find(bw =>
        (bw.player?._id?.toString() ?? bw.player?.toString()) === ball.bowler?.toString()
      );
      if (bEntry?.player?.name) overMap[ov].bowlerName = bEntry.player.name;
    }
  });
  const overKeys = Object.keys(overMap).map(Number).sort((a, b) => a - b);

  return (
    <Panel>
      {/* ── Header ── */}
      <div style={{ padding: '16px 20px', background: C.bg2, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: C.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {battingTeamName ?? '—'}
          </span>
          <span style={{ fontSize: 22, fontWeight: 900, color: C.gold, fontFamily: 'var(--font-bebas)', letterSpacing: '-0.01em' }}>
            {innings.runs ?? 0}
            <span style={{ color: C.red, fontSize: 18 }}>/{innings.wickets ?? 0}</span>
            <span style={{ fontSize: 13, color: C.muted, fontFamily: 'inherit', fontWeight: 600, marginLeft: 8 }}>
              ({oversDisplay(innings.overs ?? 0, innings.balls ?? 0)} / {totalOvers ?? '?'}.0 ov)
            </span>
          </span>
        </div>
      </div>

      {/* ── Batting table ── */}
      <SectionHead label={`${battingTeamName ?? ''} Batting`} />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 480, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thSt, textAlign: 'left' }}>Batsman</th>
              <th style={{ ...thSt, textAlign: 'left' }}>Dismissal</th>
              <th style={{ ...thSt, textAlign: 'right' }}>R</th>
              <th style={{ ...thSt, textAlign: 'right' }}>B</th>
              <th style={{ ...thSt, textAlign: 'right' }}>4s</th>
              <th style={{ ...thSt, textAlign: 'right' }}>6s</th>
              <th style={{ ...thSt, textAlign: 'right' }}>SR</th>
            </tr>
          </thead>
          <tbody>
            {batters.length > 0 ? batters.map((b, i) => {
              const isOut = b.status === 'out';
              const sr = (b.balls ?? 0) > 0 ? (((b.runs ?? 0) / b.balls) * 100).toFixed(0) : '—';
              return (
                <tr key={i}>
                  <td style={{ ...tdSt, textAlign: 'left', fontWeight: 700, color: C.text, textTransform: 'uppercase', fontSize: 12 }}>
                    {b.player?.name ?? 'Player'}
                    <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: isOut ? C.red : C.green }}>
                      {isOut ? 'out' : 'not out'}
                    </span>
                  </td>
                  <td style={{ ...tdSt, textAlign: 'left', fontSize: 11, color: C.dim, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {b.dismissal ?? (isOut ? b.dismissalType ?? '—' : '—')}
                  </td>
                  <td style={{ ...tdSt, textAlign: 'right', color: C.gold, fontWeight: 900, fontFamily: 'var(--font-bebas)', fontSize: 15 }}>{b.runs ?? 0}</td>
                  <td style={{ ...tdSt, textAlign: 'right' }}>{b.balls ?? 0}</td>
                  <td style={{ ...tdSt, textAlign: 'right', color: C.blue, fontWeight: 700 }}>{b.fours ?? 0}</td>
                  <td style={{ ...tdSt, textAlign: 'right', color: C.gold, fontWeight: 700 }}>{b.sixes ?? 0}</td>
                  <td style={{ ...tdSt, textAlign: 'right', color: C.muted, fontWeight: 700 }}>{sr}</td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: C.dim, fontSize: 13 }}>
                  No batting data
                </td>
              </tr>
            )}
            {/* Extras + Total */}
            {batters.length > 0 && (
              <>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <td colSpan={4} style={{ ...tdSt, color: C.dim, fontSize: 11, fontWeight: 600, borderBottom: 'none' }}>
                    Extras: <strong style={{ color: C.muted }}>{innings.extras ?? 0}</strong>
                  </td>
                  <td colSpan={3} style={{ ...tdSt, textAlign: 'right', color: C.text, fontWeight: 900, fontFamily: 'var(--font-bebas)', fontSize: 17, borderBottom: 'none' }}>
                    {innings.runs ?? 0}
                    <span style={{ color: C.red, fontSize: 14 }}>/{innings.wickets ?? 0}</span>
                    <span style={{ fontSize: 11, color: C.dim, fontFamily: 'inherit', fontWeight: 600, marginLeft: 6 }}>
                      ({oversDisplay(innings.overs ?? 0, innings.balls ?? 0)} ov)
                    </span>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Bowling table ── */}
      <SectionHead label={`${bowlingTeamName ?? ''} Bowling`} />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 360, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thSt, textAlign: 'left' }}>Bowler</th>
              <th style={{ ...thSt, textAlign: 'right' }}>O</th>
              <th style={{ ...thSt, textAlign: 'right' }}>M</th>
              <th style={{ ...thSt, textAlign: 'right' }}>R</th>
              <th style={{ ...thSt, textAlign: 'right' }}>W</th>
              <th style={{ ...thSt, textAlign: 'right' }}>Eco</th>
            </tr>
          </thead>
          <tbody>
            {bowlers.length > 0 ? bowlers.map((b, i) => {
              const eco = economyRate(b.runs ?? 0, b.overs ?? 0, b.balls ?? 0);
              return (
                <tr key={i}>
                  <td style={{ ...tdSt, textAlign: 'left', fontWeight: 700, color: C.text, textTransform: 'uppercase', fontSize: 12 }}>
                    {b.player?.name ?? 'Bowler'}
                  </td>
                  <td style={{ ...tdSt, textAlign: 'right' }}>{b.overs ?? 0}.{b.balls ?? 0}</td>
                  <td style={{ ...tdSt, textAlign: 'right' }}>{b.maidens ?? 0}</td>
                  <td style={{ ...tdSt, textAlign: 'right', color: C.text, fontWeight: 700 }}>{b.runs ?? 0}</td>
                  <td style={{ ...tdSt, textAlign: 'right', color: C.red, fontWeight: 900, fontFamily: 'var(--font-bebas)', fontSize: 15 }}>{b.wickets ?? 0}</td>
                  <td style={{ ...tdSt, textAlign: 'right', color: C.muted, fontWeight: 700 }}>{eco}</td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: C.dim, fontSize: 13 }}>
                  No bowling data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Over-by-over history ── */}
      {overKeys.length > 0 && (
        <>
          <SectionHead label="Over History" />
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {overKeys.map(ov => {
              const { balls, bowlerName } = overMap[ov];
              const overRuns = balls.reduce((s, b) => s + (b.runs ?? 0), 0);
              return (
                <div key={ov} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: C.bg2,
                  border: `1px solid ${C.border}`,
                  flexWrap: 'wrap',
                }}>
                  {/* Over number */}
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.dim, minWidth: 28 }}>
                    {ov + 1}
                  </span>
                  {/* Bowler name */}
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, minWidth: 80, flex: '0 0 auto' }}>
                    {bowlerName || '—'}
                  </span>
                  {/* Ball badges */}
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
                    {balls.map((ball, bi) => {
                      const bStyle = getBallBadgeStyle(ball);
                      const bLabel = getBallLabel(ball);
                      return (
                        <div key={bi} style={{
                          width: 30,
                          height: 30,
                          borderRadius: 7,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 900,
                          fontFamily: 'var(--font-bebas)',
                          ...bStyle,
                        }}>
                          {bLabel}
                        </div>
                      );
                    })}
                  </div>
                  {/* Over runs */}
                  <span style={{ fontSize: 12, fontWeight: 800, color: C.gold, minWidth: 32, textAlign: 'right' }}>
                    {overRuns}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Panel>
  );
}

/* ─── main page ──────────────────────────────────────────────────────────── */
export default function MatchSummaryPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [match, setMatch] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
    } else if (!loading && user) {
      api.get(`/matches/${id}`).then(d => {
        if (d?._id) setMatch(d);
      });
    }
  }, [loading, user, id]);

  /* ── loading spinner ── */
  if (!match) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{
            width: 32,
            height: 32,
            border: `2px solid ${C.goldDim}`,
            borderTopColor: C.gold,
            borderRadius: '50%',
            animation: 'spin .8s linear infinite',
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </AdminLayout>
    );
  }

  const status = match.status ?? 'scheduled';
  const isLive = status === 'live';
  const isCompleted = status === 'completed';
  const totalOvers = match.overs ?? 6;

  /* toss info */
  const tossText = match.tossWinner?.name
    ? `${match.tossWinner.name} won the toss and elected to ${match.tossDecision ?? 'bat'} first`
    : null;

  /* duration */
  let duration = null;
  if (match.startTime && match.endTime) {
    const mins = Math.round((new Date(match.endTime) - new Date(match.startTime)) / 60000);
    duration = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  }

  /* status badge */
  const badgeStyle = isLive
    ? { background: C.redDim, color: C.red, border: '1px solid rgba(239,68,68,0.35)' }
    : isCompleted
    ? { background: 'rgba(34,197,94,0.1)', color: C.green, border: '1px solid rgba(34,197,94,0.3)' }
    : { background: C.goldDim, color: C.gold, border: `1px solid rgba(201,162,39,0.3)` };

  return (
    <AdminLayout>
      <div className="admin-page-pad" style={{ display: 'flex', flexDirection: 'column', gap: 20, boxSizing: 'border-box' }}>

        {/* ── Back button ── */}
        <div>
          <Link href="/admin/matches" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 700,
            color: C.muted,
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 8,
            background: C.bg2,
            border: `1px solid ${C.border}`,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Matches
          </Link>
        </div>

        {/* ── Match header ── */}
        <Panel>
          <div style={{ padding: '20px 24px' }}>
            {/* Status badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 100,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.12em',
                ...badgeStyle,
              }}>
                {isLive && (
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: C.red,
                    display: 'inline-block',
                    boxShadow: `0 0 6px ${C.red}`,
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                )}
                {isLive ? 'LIVE' : isCompleted ? 'COMPLETED' : 'SCHEDULED'}
              </div>
              {match.group && (
                <span style={{ fontSize: 11, color: C.dim, fontWeight: 600 }}>{match.group}</span>
              )}
            </div>

            {/* Team names */}
            <h1 style={{
              fontSize: 'clamp(22px,4vw,36px)',
              fontWeight: 900,
              color: C.text,
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
              fontFamily: 'var(--font-bebas)',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              {match.teamA?.name ?? '—'}
              <span style={{ color: C.gold, margin: '0 12px', fontSize: '0.65em' }}>VS</span>
              {match.teamB?.name ?? '—'}
            </h1>

            {/* Meta row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: C.dim, fontWeight: 600 }}>
              {match.ground && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {match.ground}
                </span>
              )}
              <span>{totalOvers} overs format</span>
            </div>

            {/* Toss */}
            {tossText && (
              <div style={{
                marginTop: 14,
                padding: '10px 14px',
                borderRadius: 10,
                background: C.bg2,
                border: `1px solid ${C.border}`,
                fontSize: 13,
                color: C.muted,
              }}>
                <span style={{ color: C.gold, fontWeight: 700 }}>{match.tossWinner?.name}</span>
                {' '}won the toss and elected to{' '}
                <span style={{ color: C.gold, fontWeight: 700 }}>{match.tossDecision ?? 'bat'} first</span>
              </div>
            )}

            {/* Result description */}
            {isCompleted && match.result?.description && (
              <div style={{
                marginTop: 12, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)',
                fontSize: 13, color: C.green, fontWeight: 600,
              }}>
                {match.result.description}
              </div>
            )}
          </div>
        </Panel>

        {/* ── Innings 1 scorecard ── */}
        <ScorecardInnings
          innings={match.innings1}
          battingTeamName={match.teamA?.name}
          bowlingTeamName={match.teamB?.name}
          totalOvers={totalOvers}
        />

        {/* ── Innings 2 scorecard (if exists) ── */}
        {match.innings2 && (
          <ScorecardInnings
            innings={match.innings2}
            battingTeamName={match.teamB?.name}
            bowlingTeamName={match.teamA?.name}
            totalOvers={totalOvers}
          />
        )}

        {/* ── Match result card ── */}
        {isCompleted && (
          <Panel>
            <SectionHead label="Match Result" />
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {match.result?.winner?.name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: C.goldDim, border: `1px solid rgba(201,162,39,0.3)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: C.dim, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>Winner</p>
                    <p style={{ fontSize: 18, fontWeight: 900, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'var(--font-bebas)' }}>
                      {match.result.winner.name}
                    </p>
                  </div>
                </div>
              )}
              {match.result?.description && (
                <p style={{ fontSize: 13, color: C.muted, fontWeight: 600, paddingLeft: 52 }}>
                  {match.result.description}
                </p>
              )}
              {duration && (
                <p style={{ fontSize: 12, color: C.dim, fontWeight: 600, paddingLeft: 52 }}>
                  Duration: <span style={{ color: C.muted }}>{duration}</span>
                </p>
              )}
            </div>
          </Panel>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </AdminLayout>
  );
}