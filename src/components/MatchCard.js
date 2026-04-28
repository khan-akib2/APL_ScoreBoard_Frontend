'use client';
import Link from 'next/link';

export default function MatchCard({ match }) {
  const isLive     = match.status === 'live';
  const isDone     = match.status === 'completed';
  const isUpcoming = match.status === 'scheduled';

  const currentInnings = match.currentInnings || 1;
  const innings    = currentInnings === 1 ? match.innings1 : match.innings2;
  const striker    = innings?.currentBatsmen?.find(b => b.isStriker);
  const nonStriker = innings?.currentBatsmen?.find(b => !b.isStriker);
  const currentBowler = innings?.currentBowler;

  return (
    <Link href={`/matches/${match._id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div style={{
        position: 'relative',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        padding: '20px',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'border-color .25s, transform .25s, box-shadow .25s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
            {match.group} · {match.ground}
          </span>

          {isLive && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 100, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 6px #ef4444' }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', letterSpacing: '0.1em' }}>LIVE</span>
            </div>
          )}
          {isDone && (
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', padding: '4px 10px', borderRadius: 100, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
              FINISHED
            </span>
          )}
          {isUpcoming && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa', padding: '4px 10px', borderRadius: 100, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)' }}>
              UPCOMING
            </span>
          )}
        </div>

        {/* Teams row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          {/* Team A */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {match.teamA?.name}
            </p>
            {match.innings1 ? (
              <>
                <p style={{ fontSize: 32, fontWeight: 900, color: 'var(--gold)', lineHeight: 1, fontFamily: 'var(--font-bebas)' }}>
                  {match.innings1.runs}
                  <span style={{ fontSize: 18, color: 'var(--text-muted)', fontWeight: 700 }}>/{match.innings1.wickets}</span>
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                  ({match.innings1.overs}.{match.innings1.balls} ov)
                </p>
              </>
            ) : (
              <p style={{ fontSize: 24, color: 'var(--text-dim)', fontFamily: 'var(--font-bebas)' }}>—</p>
            )}
          </div>

          {/* VS */}
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--gold)', fontFamily: 'var(--font-bebas)', letterSpacing: '0.05em' }}>VS</span>
          </div>

          {/* Team B */}
          <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {match.teamB?.name}
            </p>
            {match.innings2 ? (
              <>
                <p style={{ fontSize: 32, fontWeight: 900, color: 'var(--gold)', lineHeight: 1, fontFamily: 'var(--font-bebas)' }}>
                  {match.innings2.runs}
                  <span style={{ fontSize: 18, color: 'var(--text-muted)', fontWeight: 700 }}>/{match.innings2.wickets}</span>
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                  ({match.innings2.overs}.{match.innings2.balls} ov)
                </p>
              </>
            ) : (
              <p style={{ fontSize: 24, color: 'var(--text-dim)', fontFamily: 'var(--font-bebas)' }}>—</p>
            )}
          </div>
        </div>

        {/* Result */}
        {match.result?.description && (
          <div style={{ paddingTop: 12, borderTop: '1px solid var(--border-subtle)', marginTop: 4 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', textAlign: 'center' }}>
              {match.result.description}
            </p>
          </div>
        )}

        {/* Live player info */}
        {isLive && (striker || currentBowler) && (
          <div style={{ paddingTop: 12, borderTop: '1px solid var(--border-subtle)', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {striker && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{striker.player?.name} *</span>
                <span style={{ color: 'var(--gold)', fontWeight: 800, fontFamily: 'var(--font-bebas)', fontSize: 13 }}>{striker.runs}({striker.balls})</span>
              </div>
            )}
            {nonStriker && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{nonStriker.player?.name}</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 700, fontFamily: 'var(--font-bebas)', fontSize: 13 }}>{nonStriker.runs}({nonStriker.balls})</span>
              </div>
            )}
            {currentBowler?.player && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{currentBowler.player.name}</span>
                <span style={{ color: 'var(--red)', fontWeight: 800, fontFamily: 'var(--font-bebas)', fontSize: 13 }}>
                  {currentBowler.overs}.{currentBowler.balls}-{currentBowler.runs}/{currentBowler.wickets}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
