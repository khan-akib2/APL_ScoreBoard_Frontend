'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import UserLayout from '@/components/UserLayout';
import MatchCard from '@/components/MatchCard';
import { api } from '@/services/api';

const STAGES = ['group', 'semi', 'final'];
const STAGE_LABELS = { group: 'Group Stage', semi: 'Semi Finals', final: 'Final' };

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [activeStage, setActiveStage] = useState('group');

  useEffect(() => {
    api.get('/matches').then((data) => {
      if (Array.isArray(data)) setMatches(data);
    });
  }, []);

  const filtered = matches.filter((m) => m.stage === activeStage);
  const groupAMatches = filtered.filter((m) => m.group === 'A');
  const groupBMatches = filtered.filter((m) => m.group === 'B');

  return (
    <UserLayout>
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 28, letterSpacing: '-0.02em' }}>
            <span style={{ color: 'var(--gold)' }}>MATCHES</span>
          </h1>

          {/* Stage tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
            {STAGES.map((s) => (
              <button
                key={s}
                onClick={() => setActiveStage(s)}
                style={{
                  padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', border: 'none', transition: 'all .2s',
                  background: activeStage === s ? 'var(--gold)' : 'var(--bg-card)',
                  color: activeStage === s ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  boxShadow: activeStage === s ? '0 4px 16px rgba(201,162,39,0.25)' : 'none',
                  outline: activeStage !== s ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                {STAGE_LABELS[s]}
              </button>
            ))}
          </div>

          {activeStage === 'group' ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p style={{ fontWeight: 800, marginBottom: 14, fontSize: 13, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Group A — Ground 1</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {groupAMatches.length === 0
                    ? <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No matches yet</p>
                    : groupAMatches.map(m => <MatchCard key={m._id} match={m} />)}
                </div>
              </div>
              <div>
                <p style={{ fontWeight: 800, marginBottom: 14, fontSize: 13, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Group B — Ground 2</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {groupBMatches.length === 0
                    ? <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No matches yet</p>
                    : groupBMatches.map(m => <MatchCard key={m._id} match={m} />)}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 600 }}>
              {filtered.length === 0
                ? <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No matches yet</p>
                : filtered.map(m => <MatchCard key={m._id} match={m} />)}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
