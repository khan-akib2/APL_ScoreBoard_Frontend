export default function StandingsTable({ teams, groupName }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 900, color: 'var(--bg-primary)',
        }}>{groupName}</div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Group {groupName}</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Points Table</p>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: 340, borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
              {['#', 'Team', 'P', 'W', 'L', 'Pts', 'NRR'].map((h, i) => (
                <th key={h} style={{
                  padding: i === 0 ? '10px 16px 10px 20px' : '10px 12px',
                  textAlign: i <= 1 ? 'left' : 'center',
                  fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams && teams.length > 0 ? teams.map((team, i) => {
              const q = team.qualification; // 'winner' | 'wildcard' | 'eliminated' | undefined
              const isWinner   = q === 'winner';
              const isWildcard = q === 'wildcard';
              const isOut      = q === 'eliminated';

              return (
                <tr key={team._id} style={{
                  borderBottom: i < teams.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  opacity: isOut ? 0.55 : 1,
                  transition: 'background .15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px 14px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{team.name}</span>
                      {isWinner && (
                        <span style={{
                          fontSize: 9, fontWeight: 800, color: 'var(--green)',
                          padding: '2px 6px', borderRadius: 4,
                          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                          letterSpacing: '0.06em', whiteSpace: 'nowrap',
                        }}>GW</span>
                      )}
                      {isWildcard && (
                        <span style={{
                          fontSize: 9, fontWeight: 800, color: '#60a5fa',
                          padding: '2px 6px', borderRadius: 4,
                          background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)',
                          letterSpacing: '0.06em', whiteSpace: 'nowrap',
                        }}>WC</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>{team.stats.played}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', color: 'var(--green)', fontWeight: 700 }}>{team.stats.won}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', color: 'var(--red)', fontWeight: 700 }}>{team.stats.lost}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 30, height: 30, borderRadius: 8,
                      background: 'rgba(201,162,39,0.12)', border: '1px solid var(--border-default)',
                      color: 'var(--gold)', fontWeight: 900, fontSize: 13,
                    }}>{team.stats.points}</span>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 12 }}>
                    {team.stats.nrr != null ? (team.stats.nrr >= 0 ? '+' : '') + team.stats.nrr.toFixed(3) : '—'}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No teams yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      {teams && teams.length > 0 && (
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--green)', padding: '2px 6px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>GW</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Group Winner</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#60a5fa', padding: '2px 6px', borderRadius: 4, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)' }}>WC</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Wildcard (Best NRR)</span>
          </div>
        </div>
      )}
    </div>
  );
}
