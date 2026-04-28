'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import UserLayout from '@/components/UserLayout';
import { api } from '@/services/api';
import { calcRunRate, calcRequiredRunRate, ballsLeft, strikeRate, economyRate } from '@/utils/cricket';

export default function MatchDetailPage() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setSyncing(true);
      const d = await api.get(`/matches/${id}`);
      if (d._id) setMatch(d);
      setSyncing(false);
    };
    fetch();
    const t = setInterval(fetch, 4000);
    return () => clearInterval(t);
  }, [id]);

  if (!match) return <UserLayout><Loading /></UserLayout>;

  const isLive      = match.status === 'live';
  const currentInn  = match.currentInnings || 1;
  const innings     = currentInn === 1 ? match.innings1 : match.innings2;
  const battingTeam = currentInn === 1 ? match.teamA : match.teamB;
  const bowlingTeam = currentInn === 1 ? match.teamB : match.teamA;
  const striker     = innings?.currentBatsmen?.find(b => b.isStriker);
  const nonStriker  = innings?.currentBatsmen?.find(b => !b.isStriker);
  const bowler      = innings?.currentBowler;
  const TOTAL_OVERS = match.overs || 5;
  const remaining   = ballsLeft(TOTAL_OVERS, innings?.overs || 0, innings?.balls || 0);
  const crr         = calcRunRate(innings?.runs || 0, innings?.overs || 0, innings?.balls || 0);
  const currentOverBalls = (innings?.ballByBall || []).filter(b => b.over === (innings?.overs || 0));

  let target = 0, runsNeeded = 0, rrr = '—';
  if (currentInn === 2 && match.innings1) {
    target    = match.innings1.runs + 1;
    runsNeeded = target - (innings?.runs || 0);
    rrr       = calcRequiredRunRate(runsNeeded, remaining);
  }

  return (
    <UserLayout>
      {/* Sync bar */}
      {syncing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, background: 'var(--gold)', zIndex: 100, animation: 'syncBar 1s ease-in-out infinite' }} />
      )}

      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '20px 24px 40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Match Header ── */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
                  {match.group} · {match.ground} · T{TOTAL_OVERS} Format
                </p>
                <h1 style={{ fontSize: 'clamp(20px,4vw,36px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1, fontFamily: 'var(--font-bebas)', textTransform: 'uppercase' }}>
                  {match.teamA?.name}
                  <span style={{ color: 'var(--gold)', margin: '0 12px', fontSize: '0.65em' }}>VS</span>
                  {match.teamB?.name}
                </h1>
              </div>
              {isLive && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 100, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', flexShrink: 0 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 8px #ef4444', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#ef4444', letterSpacing: '0.12em', fontFamily: 'var(--font-bebas)' }}>LIVE</span>
                </div>
              )}
            </div>
            {match.tossWinner && (
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', fontSize: 13, color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{match.tossWinner.name}</span>
                {' '}won the toss and elected to{' '}
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{match.tossDecision} first</span>
              </div>
            )}
          </Card>

          {/* ── Scorecard ── */}
          {innings && (
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {/* Teams row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, padding: '24px 24px 20px', alignItems: 'center' }}>
                <div>
                  <Label>Batting</Label>
                  <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{battingTeam?.name}</p>
                  <p style={{ fontSize: 'clamp(40px,8vw,64px)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-bebas)' }}>
                    {innings.runs || 0}
                    <span style={{ fontSize: '0.55em', color: 'var(--red)', fontWeight: 900 }}>/{innings.wickets || 0}</span>
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {innings.overs || 0}.{innings.balls || 0} / {TOTAL_OVERS} overs
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-bebas)' }}>VS</span>
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.08em' }}>INN {currentInn}</span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <Label style={{ textAlign: 'right' }}>Bowling</Label>
                  <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{bowlingTeam?.name}</p>
                  <p style={{ fontSize: 'clamp(40px,8vw,64px)', fontWeight: 900, color: 'var(--text-dim)', lineHeight: 1, fontFamily: 'var(--font-bebas)' }}>—</p>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>Yet to bat</p>
                </div>
              </div>

              {/* Stats strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                {[
                  { l: 'CRR',    v: crr,       s: 'runs/over' },
                  { l: 'Balls',  v: remaining,  s: 'remaining' },
                  { l: 'Extras', v: innings.extras || 0, s: 'wd/nb/b' },
                  { l: 'Target', v: currentInn === 2 ? target : '—', s: 'inn 2' },
                ].map((s, i) => (
                  <div key={s.l} style={{ padding: '14px 12px', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <p style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>{s.l}</p>
                    <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-bebas)', lineHeight: 1 }}>{s.v}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 3 }}>{s.s}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── Match Situation ── */}
          {innings && (
            <Card>
              <Label>Match Situation</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 12 }}>
                <SitBox value={innings.runs || 0}              label="Runs Scored"    color="var(--gold)" />
                <SitBox value={innings.wickets || 0}           label="Wickets Lost"   color="var(--red)"  border />
                <SitBox value={10 - (innings.wickets || 0)}    label="Wickets Remain" color="var(--green)" border />
              </div>
              {currentInn === 2 && target > 0 && (
                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                  <SitBox value={runsNeeded > 0 ? runsNeeded : 0} label="Runs Needed"    color="var(--text-primary)" />
                  <SitBox value={rrr}                              label="Required RR"    color="var(--red)" border />
                </div>
              )}
            </Card>
          )}

          {/* ── At the Crease + Bowling ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            <Card>
              <Label>At the Crease</Label>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {striker ? (
                  <BatsmanRow b={striker} isStriker />
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>Waiting for batsmen...</p>
                )}
                {nonStriker && <BatsmanRow b={nonStriker} />}
              </div>
            </Card>

            <Card>
              <Label>Bowling Attack</Label>
              <div style={{ marginTop: 12 }}>
                {bowler?.player ? (
                  <BowlerRow b={bowler} />
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '16px 0', textAlign: 'center' }}>Waiting for bowler...</p>
                )}
              </div>

              <Label style={{ marginTop: 16 }}>This Over</Label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {[...Array(6)].map((_, i) => <BallDot key={i} ball={currentOverBalls[i]} />)}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                {[
                  { label: '4', color: 'var(--green)',  bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)'   },
                  { label: '6', color: 'var(--gold)',   bg: 'rgba(201,162,39,0.1)',  border: 'rgba(201,162,39,0.3)'  },
                  { label: 'W', color: 'var(--red)',    bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)'   },
                  { label: '·', color: 'var(--text-dim)', bg: 'var(--bg-elevated)', border: 'var(--border-subtle)'  },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${l.border}`, background: l.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: l.color, fontFamily: 'var(--font-bebas)' }}>{l.label}</div>
                    {l.label === '4' ? 'Four' : l.label === '6' ? 'Six' : l.label === 'W' ? 'Wicket' : 'Dot'}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ── Scorecards ── */}
          {match.innings1 && <Scorecard innings={match.innings1} label={`${match.teamA?.name} Batting`} bowlingTeam={match.teamB?.name} />}
          {match.innings2 && <Scorecard innings={match.innings2} label={`${match.teamB?.name} Batting`} bowlingTeam={match.teamA?.name} />}

        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
        @keyframes syncBar { 0%{opacity:1} 50%{opacity:0.4} 100%{opacity:1} }
      `}</style>
    </UserLayout>
  );
}

/* ─── sub-components ─────────────────────────────────────────────────────── */

function Card({ children, style = {} }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '20px', ...style }}>
      {children}
    </div>
  );
}

function Label({ children, style = {} }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', ...style }}>
      {children}
    </p>
  );
}

function SitBox({ value, label, color, border }) {
  return (
    <div style={{ textAlign: 'center', padding: '12px 8px', borderLeft: border ? '1px solid var(--border-subtle)' : 'none' }}>
      <p style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, color, lineHeight: 1, fontFamily: 'var(--font-bebas)' }}>{value}</p>
      <p style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6, fontWeight: 700 }}>{label}</p>
    </div>
  );
}

function BatsmanRow({ b, isStriker }) {
  const sr = strikeRate(b.runs, b.balls);
  return (
    <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isStriker && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />}
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{b.player?.name || '—'}</span>
        </div>
        <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-bebas)' }}>
          {b.runs} <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>({b.balls})</span>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
        <span>4s <strong style={{ color: 'var(--green)' }}>{b.fours}</strong></span>
        <span>6s <strong style={{ color: 'var(--gold)' }}>{b.sixes}</strong></span>
        <span>SR <strong style={{ color: 'var(--text-secondary)' }}>{sr}</strong></span>
      </div>
    </div>
  );
}

function BowlerRow({ b }) {
  const eco = economyRate(b.runs, b.overs, b.balls);
  return (
    <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{b.player?.name || '—'}</span>
        <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--red)', fontFamily: 'var(--font-bebas)' }}>{b.wickets}/{b.runs}</span>
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
        <span>Ov <strong style={{ color: 'var(--text-secondary)' }}>{b.overs}.{b.balls}</strong></span>
        <span>Eco <strong style={{ color: 'var(--red)' }}>{eco}</strong></span>
      </div>
    </div>
  );
}

function BallDot({ ball }) {
  if (!ball) return (
    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--text-dim)', fontFamily: 'var(--font-bebas)' }}>·</div>
  );

  let bg = 'var(--bg-elevated)', color = 'var(--text-secondary)', border = 'var(--border-subtle)';
  let label = String(ball.runs);

  if (ball.isWicket) {
    bg = 'rgba(239,68,68,0.12)'; color = 'var(--red)'; border = 'rgba(239,68,68,0.4)'; label = 'W';
  } else if (ball.runs === 6) {
    bg = 'rgba(201,162,39,0.12)'; color = 'var(--gold)'; border = 'rgba(201,162,39,0.4)';
  } else if (ball.runs === 4) {
    bg = 'rgba(34,197,94,0.12)'; color = 'var(--green)'; border = 'rgba(34,197,94,0.4)';
  } else if (ball.extras === 'wd') {
    bg = 'rgba(251,146,60,0.1)'; color = '#fb923c'; border = 'rgba(251,146,60,0.3)'; label = 'Wd';
  } else if (ball.extras?.startsWith('nb')) {
    bg = 'rgba(251,146,60,0.1)'; color = '#fb923c'; border = 'rgba(251,146,60,0.3)'; label = 'Nb';
  }

  return (
    <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color, fontFamily: 'var(--font-bebas)' }}>
      {label}
    </div>
  );
}

function Scorecard({ innings, label, bowlingTeam }) {
  if (!innings) return null;
  const thStyle = { padding: '10px 12px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' };
  const tdStyle = { padding: '12px', fontSize: 13, borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' };

  return (
    <Card>
      <Label>{label}</Label>
      <div style={{ overflowX: 'auto', marginTop: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: 'left' }}>Batsman</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>R</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>B</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>4s</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>6s</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>SR</th>
            </tr>
          </thead>
          <tbody>
            {innings.batting?.length > 0 ? innings.batting.map((b, i) => (
              <tr key={i} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', fontSize: 12 }}>
                  {b.player?.name || 'Player'}
                  {b.status === 'out' && <span style={{ fontSize: 10, color: 'var(--red)', marginLeft: 6, fontWeight: 600 }}>out</span>}
                  {b.status === 'not out' && <span style={{ fontSize: 10, color: 'var(--green)', marginLeft: 6, fontWeight: 600 }}>not out</span>}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--gold)', fontWeight: 900, fontFamily: 'var(--font-bebas)', fontSize: 15 }}>{b.runs}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{b.balls}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--green)', fontWeight: 700 }}>{b.fours}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--gold)', fontWeight: 700 }}>{b.sixes}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 700 }}>{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(0) : '—'}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No batting data yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '20px 0' }} />

      <Label>{bowlingTeam} Bowling</Label>
      <div style={{ overflowX: 'auto', marginTop: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, textAlign: 'left' }}>Bowler</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>O</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>M</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>R</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>W</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Eco</th>
            </tr>
          </thead>
          <tbody>
            {innings.bowling?.length > 0 ? innings.bowling.map((b, i) => (
              <tr key={i} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', fontSize: 12 }}>{b.player?.name || 'Bowler'}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{b.overs}.{b.balls}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{b.maidens || 0}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--text-primary)', fontWeight: 700 }}>{b.runs}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--red)', fontWeight: 900, fontFamily: 'var(--font-bebas)', fontSize: 15 }}>{b.wickets}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 700 }}>{b.economy?.toFixed(1) || '—'}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No bowling data yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border-default)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
