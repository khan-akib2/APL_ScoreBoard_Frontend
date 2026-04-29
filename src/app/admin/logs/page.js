'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const EVENT_STYLES = {
  match_started:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)',   label: 'STARTED'   },
  innings_complete:{ color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)',  label: 'INNINGS'   },
  match_completed: { color: '#c9a227', bg: 'rgba(201,162,39,0.1)',  border: 'rgba(201,162,39,0.25)',  label: 'COMPLETED' },
  super_over:      { color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)',  label: 'SUPER OVR' },
  match_reset:     { color: '#8b9db7', bg: 'rgba(139,157,183,0.08)',border: 'rgba(139,157,183,0.2)',  label: 'RESET'     },
};

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function LogTable({ matches, title, color }) {
  const logs = matches.flatMap(m =>
    (m.logs || []).map(log => ({ ...log, match: m }))
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div style={{
      background: '#0a1628',
      border: `1px solid ${color}30`,
      borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)',
    }}>
      {/* Title bar */}
      <div style={{
        padding: '12px 20px',
        background: 'linear-gradient(135deg, #0f1e35, #0a1628)',
        borderBottom: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(239,68,68,0.55)' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,165,0,0.45)' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(34,197,94,0.45)' }} />
          </div>
          <p style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: '0.08em' }}>{title}</p>
        </div>
        <span style={{ fontSize: 10, color: '#4a6a82', fontWeight: 600 }}>{logs.length} ENTRIES</span>
      </div>

      {/* Column headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '90px 110px 1fr 150px', padding: '8px 16px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {['Time', 'Event', 'Details', 'Match'].map(h => (
          <p key={h} style={{ fontSize: 10, fontWeight: 700, color: '#4a6a82', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</p>
        ))}
      </div>

      {/* Rows */}
      <div style={{ maxHeight: 340, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(201,162,39,0.2) transparent' }}>
        {logs.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#4a6a82', fontSize: 13 }}>
            No logs yet for {title}
          </div>
        ) : logs.map((log, i) => {
          const es = EVENT_STYLES[log.event] || EVENT_STYLES.match_reset;
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '90px 110px 1fr 150px',
              padding: '11px 16px',
              borderBottom: i < logs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <p style={{ fontSize: 11, color: '#8b9db7', fontFamily: 'monospace', alignSelf: 'center' }}>{fmt(log.timestamp)}</p>
              <div style={{ alignSelf: 'center' }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: es.color, padding: '3px 8px', borderRadius: 4, background: es.bg, border: `1px solid ${es.border}`, letterSpacing: '0.1em' }}>
                  {es.label}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#c8d4e0', alignSelf: 'center', paddingRight: 12 }}>{log.message}</p>
              <p style={{ fontSize: 11, color: '#4a6a82', alignSelf: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {log.match?.teamA?.name} vs {log.match?.teamB?.name}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)', fontSize: 11, color: '#4a6a82' }}>
        {matches.length} match{matches.length !== 1 ? 'es' : ''} · Auto-refreshes every 15s
      </div>
    </div>
  );
}

export default function AdminLogs() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
    else if (!loading && user) load();
  }, [loading, user]);

  const load = async () => {
    setRefreshing(true);
    const data = await api.get('/matches/logs');
    if (Array.isArray(data)) setMatches(data);
    setRefreshing(false);
  };

  useEffect(() => {
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const groupA    = matches.filter(m => m.group === 'A');
  const groupB    = matches.filter(m => m.group === 'B');
  const knockouts = matches.filter(m => m.stage === 'semi' || m.stage === 'final');

  return (
    <AdminLayout>
      <div className="admin-page-pad">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#c9a227', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>Admin Panel</p>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#e8e8e8', letterSpacing: '-0.02em', marginBottom: 4 }}>Match Logs</h1>
            <p style={{ fontSize: 13, color: '#4a6a82' }}>Automatic timeline of all match events · {matches.length} matches with logs</p>
          </div>
          <button onClick={load} disabled={refreshing} style={{
            padding: '9px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.04)', color: '#8b9db7',
            cursor: refreshing ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 12,
            display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: refreshing ? 'spin .8s linear infinite' : 'none' }}>
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* Group A + Group B side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 20, marginBottom: 20 }}>
          <LogTable matches={groupA} title="GROUP A LOGS" color="#c9a227" />
          <LogTable matches={groupB} title="GROUP B LOGS" color="#60a5fa" />
        </div>

        {/* Knockout logs */}
        {knockouts.length > 0 && (
          <LogTable matches={knockouts} title="KNOCKOUT LOGS" color="#22c55e" />
        )}

      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
