'use client';
import { useEffect, useState } from 'react';
import UserLayout from '@/components/UserLayout';
import { api } from '@/services/api';

export default function LeaderboardPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await api.get('/standings/leaderboard');
      if (Array.isArray(data)) setTeams(data);
      setLoading(false);
    };
    fetch();
    const t = setInterval(fetch, 10000);
    return () => clearInterval(t);
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <UserLayout>
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '16px 16px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 100, background: 'rgba(201,162,39,0.08)', border: '1px solid var(--border-default)', fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.14em', marginBottom: 14 }}>
              SEASON 8 · 2026
            </div>
            <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>
              Overall <span style={{ color: 'var(--gold)' }}>Leaderboard</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>All 8 teams ranked by points and net run rate</p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 32, height: 32, border: '2px solid var(--border-default)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {teams.map((team, i) => {
                const q = team.qualification;
                const isWinner   = q === 'winner';
                const isWildcard = q === 'wildcard';
                const isFirst = i === 0;
                return (
                  <div key={team._id} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: isFirst ? '20px 24px' : '16px 20px',
                    borderRadius: 14,
                    background: isFirst
                      ? 'linear-gradient(135deg, rgba(201,162,39,0.12), rgba(201,162,39,0.04))'
                      : 'var(--bg-card)',
                    border: `1px solid ${isFirst ? 'rgba(201,162,39,0.3)' : (isWinner || isWildcard) ? 'rgba(201,162,39,0.12)' : 'var(--border-subtle)'}`,
                    transition: 'transform .2s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    {/* Rank */}
                    <div style={{
                      width: isFirst ? 48 : 40, height: isFirst ? 48 : 40,
                      borderRadius: 12, flexShrink: 0,
                      background: isFirst ? 'linear-gradient(135deg, #d4a82a, var(--gold))' : i === 1 ? 'rgba(192,192,192,0.15)' : i === 2 ? 'rgba(205,127,50,0.15)' : 'var(--bg-elevated)',
                      border: `1px solid ${isFirst ? 'rgba(201,162,39,0.5)' : 'var(--border-subtle)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: isFirst ? 22 : 18,
                    }}>
                      {i < 3 ? medals[i] : <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-muted)', fontFamily: 'var(--font-bebas)' }}>{i + 1}</span>}
                    </div>

                    {/* Team info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: isFirst ? 17 : 15, fontWeight: 800, color: isFirst ? 'var(--gold)' : 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {team.name}
                        </p>
                        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', padding: '2px 7px', borderRadius: 4, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', letterSpacing: '0.08em', flexShrink: 0 }}>
                          GRP {team.group}
                        </span>
                        {isWinner && (
                          <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--green)', padding: '2px 7px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', letterSpacing: '0.08em', flexShrink: 0 }}>
                            GW
                          </span>
                        )}
                        {isWildcard && (
                          <span style={{ fontSize: 9, fontWeight: 800, color: '#60a5fa', padding: '2px 7px', borderRadius: 4, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', letterSpacing: '0.08em', flexShrink: 0 }}>
                            WC
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>P <strong style={{ color: 'var(--text-secondary)' }}>{team.stats.played}</strong></span>
                        <span>W <strong style={{ color: 'var(--green)' }}>{team.stats.won}</strong></span>
                        <span>L <strong style={{ color: 'var(--red)' }}>{team.stats.lost}</strong></span>
                        <span>NRR <strong style={{ color: 'var(--text-secondary)' }}>{team.stats.nrr?.toFixed(2) || '0.00'}</strong></span>
                      </div>
                    </div>

                    {/* Points */}
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <p style={{ fontSize: isFirst ? 36 : 28, fontWeight: 900, color: isFirst ? 'var(--gold)' : 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-bebas)' }}>
                        {team.stats.points}
                      </p>
                      <p style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>pts</p>
                    </div>
                  </div>
                );
              })}

              {teams.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
                  No matches played yet
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          <div style={{ marginTop: 24, padding: '14px 20px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-muted)' }}>
            <span>P = Played</span>
            <span>W = Won</span>
            <span>L = Lost</span>
            <span>Pts = Points (Win = 2)</span>
            <span>NRR = Net Run Rate</span>
            <span style={{ color: 'var(--green)', fontWeight: 700 }}>GW = Group Winner</span>
            <span style={{ color: '#60a5fa', fontWeight: 700 }}>WC = Wildcard (Best NRR)</span>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
