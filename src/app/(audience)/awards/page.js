'use client';
import { useEffect, useState } from 'react';
import UserLayout from '@/components/UserLayout';
import { api } from '@/services/api';

const AWARD_META = {
  winner:            { label: 'Tournament Winner',       sub: 'Champions of APL Season 8'              },
  runnerUp:          { label: 'Runner Up',               sub: 'Runners-up of APL Season 8'             },
  bestBatsmanMale:   { label: 'Best Batsman',            sub: 'Male · Most runs in the tournament'     },
  bestBatsmanFemale: { label: 'Best Batsman',            sub: 'Female · Most runs in the tournament'   },
  bestBowlerMale:    { label: 'Best Bowler',             sub: 'Male · Most wickets in the tournament'  },
  bestBowlerFemale:  { label: 'Best Bowler',             sub: 'Female · Most wickets in the tournament'},
  manOfSeries:       { label: 'Man of the Series',       sub: 'Best overall male performer'            },
  womanOfSeries:     { label: 'Woman of the Series',     sub: 'Best overall female performer'          },
};

export default function AwardsPage() {
  const [awards, setAwards] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await api.get('/awards');
      setAwards(data || {});
      setLoading(false);
    };
    fetch();
    const t = setInterval(fetch, 15000);
    return () => clearInterval(t);
  }, []);

  const published = Object.entries(awards).filter(([, v]) => v?.player);

  return (
    <UserLayout>
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '16px 16px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 100, background: 'rgba(201,162,39,0.08)', border: '1px solid var(--border-default)', fontSize: 10, fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.14em', marginBottom: 16 }}>
              APL SEASON 8 · 2026
            </div>
            <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 10 }}>
              Tournament <span style={{ color: 'var(--gold)' }}>Awards</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Official awards for APL Season 8</p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 32, height: 32, border: '2px solid var(--border-default)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : published.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Awards Coming Soon</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Awards will be revealed by the tournament admin after matches complete</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {published.map(([key, award]) => {
                const meta = AWARD_META[key];
                const isTop = key === 'winner';
                return (
                  <div key={key} style={{
                    background: 'var(--bg-card)',
                    border: `1px solid ${isTop ? 'rgba(201,162,39,0.3)' : 'var(--border-subtle)'}`,
                    borderRadius: 14, overflow: 'hidden',
                    boxShadow: isTop ? '0 4px 24px rgba(201,162,39,0.1)' : 'none',
                  }}>
                    <div style={{
                      padding: '16px 24px',
                      background: isTop ? 'linear-gradient(135deg, rgba(201,162,39,0.1), rgba(201,162,39,0.03))' : 'var(--bg-elevated)',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 3 }}>{meta.sub}</p>
                        <p style={{ fontSize: 16, fontWeight: 900, color: isTop ? 'var(--gold)' : 'var(--text-primary)', letterSpacing: '-0.01em' }}>{meta.label}</p>
                      </div>
                      {isTop && (
                        <div style={{ fontSize: 32 }}>🏆</div>
                      )}
                    </div>
                    <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                        background: isTop ? 'rgba(201,162,39,0.12)' : 'var(--bg-elevated)',
                        border: `1px solid ${isTop ? 'rgba(201,162,39,0.3)' : 'var(--border-subtle)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 900, color: isTop ? 'var(--gold)' : 'var(--text-muted)',
                        fontFamily: 'var(--font-bebas)',
                      }}>
                        {award.player?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: 4, fontFamily: 'var(--font-bebas)', textTransform: 'uppercase' }}>
                          {award.player?.name || '—'}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {award.teamName}
                          {award.runs    !== undefined && <span style={{ color: 'var(--gold)', marginLeft: 10, fontWeight: 700 }}>{award.runs} runs</span>}
                          {award.wickets !== undefined && <span style={{ color: 'var(--gold)', marginLeft: 10, fontWeight: 700 }}>{award.wickets} wickets</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
