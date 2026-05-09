'use client';
import { useEffect, useState } from 'react';
import UserLayout from '@/components/UserLayout';
import { api } from '@/services/api';

const rankColors = ['var(--gold)', '#c0c0c0', '#cd7f32'];
const rankNums = ['1', '2', '3'];

const rankBg = (i) => {
  if (i === 0) return 'linear-gradient(135deg, rgba(201,162,39,0.16), rgba(201,162,39,0.06))';
  if (i === 1) return 'rgba(192,192,192,0.06)';
  if (i === 2) return 'rgba(205,127,50,0.06)';
  return 'var(--bg-card)';
};
const rankBorder = (i) => {
  if (i === 0) return 'rgba(201,162,39,0.35)';
  if (i === 1) return 'rgba(192,192,192,0.2)';
  if (i === 2) return 'rgba(205,127,50,0.2)';
  return 'var(--border-subtle)';
};
const rankColor = (i) => {
  if (i === 0) return 'var(--gold)';
  if (i === 1) return '#c0c0c0';
  if (i === 2) return '#cd7f32';
  return 'var(--text-muted)';
};

function RankBadge({ rank }) {
  const i = rank - 1;
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
      background: i < 3 ? rankBg(i) : 'var(--bg-elevated)',
      border: `1px solid ${rankBorder(i)}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: i < 3 ? 18 : 14, fontWeight: 900, fontFamily: 'var(--font-bebas)',
      color: rankColor(i),
    }}>
      {i < 3 ? rankNums[i] : rank}
    </div>
  );
}

// ── Team Leaderboard ──────────────────────────────────────────────────────────
function TeamLeaderboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let controller = new AbortController();
    const load = async () => {
      const data = await api.get('/standings/leaderboard', controller.signal);
      if (Array.isArray(data)) setTeams(data);
      setLoading(false);
    };
    load();
    const t = setInterval(load, 12000);
    return () => { controller.abort(); clearInterval(t); };
  }, []);

  if (loading) return <Spinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {teams.map((team, i) => {
        const q = team.qualification;
        return (
          <div key={team._id} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 20px', borderRadius: 14,
            background: rankBg(i), border: `1px solid ${rankBorder(i)}`,
            transition: 'transform .2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
          >
            <RankBadge rank={i + 1} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: i === 0 ? 'var(--gold)' : 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {team.name}
                </p>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', padding: '2px 7px', borderRadius: 4, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', letterSpacing: '0.08em', flexShrink: 0 }}>
                  GRP {team.group}
                </span>
                {q === 'winner' && <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--green)', padding: '2px 7px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', letterSpacing: '0.08em', flexShrink: 0 }}>GW</span>}
                {q === 'wildcard' && <span style={{ fontSize: 9, fontWeight: 800, color: '#60a5fa', padding: '2px 7px', borderRadius: 4, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', letterSpacing: '0.08em', flexShrink: 0 }}>WC</span>}
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span>P <strong style={{ color: 'var(--text-secondary)' }}>{team.stats.played}</strong></span>
                <span>W <strong style={{ color: 'var(--green)' }}>{team.stats.won}</strong></span>
                <span>L <strong style={{ color: 'var(--red)' }}>{team.stats.lost}</strong></span>
                <span>NRR <strong style={{ color: 'var(--text-secondary)' }}>{(team.stats.nrr || 0).toFixed(2)}</strong></span>
              </div>
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <p style={{ fontSize: i === 0 ? 32 : 26, fontWeight: 900, color: i === 0 ? 'var(--gold)' : 'var(--text-primary)', lineHeight: 1, fontFamily: 'var(--font-bebas)' }}>{team.stats.points}</p>
              <p style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>pts</p>
            </div>
          </div>
        );
      })}
      {teams.length === 0 && <EmptyState text="No matches played yet" />}
      <div style={{ marginTop: 16, padding: '12px 18px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-muted)' }}>
        <span>P = Played</span><span>W = Won</span><span>L = Lost</span>
        <span>Pts = Points (Win=2)</span><span>NRR = Net Run Rate</span>
        <span style={{ color: 'var(--green)', fontWeight: 700 }}>GW = Group Winner</span>
        <span style={{ color: '#60a5fa', fontWeight: 700 }}>WC = Wildcard</span>
      </div>
    </div>
  );
}

// ── Player Leaderboard row ────────────────────────────────────────────────────
function PlayerRow({ player, cols }) {
  const i = player.rank - 1;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderRadius: 12,
      background: rankBg(i), border: `1px solid ${rankBorder(i)}`,
    }}>
      <RankBadge rank={player.rank} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: i < 3 ? rankColor(i) : 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {player.name}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{player.teamName}</p>
      </div>
      <div style={{ display: 'flex', gap: 18, flexShrink: 0 }}>
        {cols.map(c => (
          <div key={c.key} style={{ textAlign: 'center', minWidth: 42 }}>
            <p style={{ fontSize: 16, fontWeight: 900, color: c.primary ? 'var(--gold)' : 'var(--text-primary)', fontFamily: 'var(--font-bebas)', lineHeight: 1 }}>
              {player[c.key] ?? '—'}
            </p>
            <p style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 1 }}>{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const BATTING_COLS  = [{ key: 'runs', label: 'Runs', primary: true }, { key: 'average', label: 'Avg' }, { key: 'strikeRate', label: 'SR' }];
const BOWLING_COLS  = [{ key: 'wickets', label: 'Wkts', primary: true }, { key: 'economy', label: 'Eco' }, { key: 'oversBowled', label: 'Ovrs' }];
const FIELDING_COLS = [{ key: 'catches', label: 'Ct', primary: true }, { key: 'runOuts', label: 'RO' }, { key: 'totalDismissals', label: 'Total' }];
const POINTS_COLS   = [{ key: 'totalPoints', label: 'Pts', primary: true }, { key: 'totalRuns', label: 'Runs' }, { key: 'totalWickets', label: 'Wkts' }];

function PlayerLeaderboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab]   = useState('batting');
  const [gender, setGender]   = useState('male');

  useEffect(() => {
    let controller = new AbortController();
    const load = async () => {
      const d = await api.get('/players/leaderboard', controller.signal);
      if (d && !d.message && !d.error) setData(d);
      setLoading(false);
    };
    load();
    const t = setInterval(load, 20000);
    return () => { controller.abort(); clearInterval(t); };
  }, []);

  if (loading) return <Spinner />;

  const colsMap = { batting: BATTING_COLS, bowling: BOWLING_COLS, fielding: FIELDING_COLS, points: POINTS_COLS };
  const players = data?.[subTab]?.[gender] || [];
  const cols = colsMap[subTab];

  const tabStyle = (id) => ({
    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontWeight: 700, fontSize: 12, fontFamily: 'inherit', letterSpacing: '0.04em',
    background: subTab === id ? 'var(--gold)' : 'var(--bg-elevated)',
    color: subTab === id ? '#060e1a' : 'var(--text-muted)',
    transition: 'all .2s',
  });

  const genderStyle = (g) => ({
    padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontWeight: 700, fontSize: 11, fontFamily: 'inherit',
    background: gender === g ? (g === 'male' ? 'rgba(96,165,250,0.2)' : 'rgba(244,114,182,0.2)') : 'var(--bg-elevated)',
    color: gender === g ? (g === 'male' ? '#60a5fa' : '#f472b6') : 'var(--text-muted)',
    border: `1px solid ${gender === g ? (g === 'male' ? 'rgba(96,165,250,0.4)' : 'rgba(244,114,182,0.4)') : 'var(--border-subtle)'}`,
    transition: 'all .2s',
  });

  return (
    <div>
      {/* Sub-tab row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['batting', 'bowling', 'fielding', 'points'].map(t => (
            <button key={t} onClick={() => setSubTab(t)} style={tabStyle(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setGender('male')}   style={genderStyle('male')}>Men</button>
          <button onClick={() => setGender('female')} style={genderStyle('female')}>Women</button>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 16px', marginBottom: 6 }}>
        <div style={{ width: 40, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Player</p>
        </div>
        <div style={{ display: 'flex', gap: 18, flexShrink: 0 }}>
          {cols.map(c => (
            <div key={c.key} style={{ minWidth: 42, textAlign: 'center' }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: c.primary ? 'var(--gold)' : 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{c.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {players.map(p => <PlayerRow key={p.playerId} player={p} cols={cols} />)}
        {players.length === 0 && <EmptyState text="No data yet — awards will populate as matches complete" />}
      </div>

      {subTab === 'points' && (
        <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-muted)' }}>
          Points: every 30 runs scored = 1 pt · every wicket taken = 1 pt
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div style={{ width: 32, height: 32, border: '2px solid var(--border-default)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 14, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12 }}>
      {text}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const [mainTab, setMainTab] = useState('teams');

  const tabStyle = (id) => ({
    padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
    fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
    background: mainTab === id ? 'var(--gold)' : 'var(--bg-card)',
    color: mainTab === id ? '#060e1a' : 'var(--text-muted)',
    border: `1px solid ${mainTab === id ? 'var(--gold)' : 'var(--border-subtle)'}`,
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
              <span style={{ color: 'var(--gold)' }}>Leaderboards</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Teams ranked by points · Player stats from completed matches</p>
          </div>

          {/* Main tabs */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            <button onClick={() => setMainTab('teams')}   style={tabStyle('teams')}>Teams</button>
            <button onClick={() => setMainTab('players')} style={tabStyle('players')}>Players</button>
          </div>

          {mainTab === 'teams'   && <TeamLeaderboard />}
          {mainTab === 'players' && <PlayerLeaderboard />}
        </div>
      </div>
    </UserLayout>
  );
}
