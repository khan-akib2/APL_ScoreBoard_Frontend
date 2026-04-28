'use client';
import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import MatchCard from '@/components/MatchCard';
import StandingsTable from '@/components/StandingsTable';
import { api } from '@/services/api';

export default function Dashboard() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [liveMatches, setLiveMatches] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [standings, setStandings] = useState({ groupA: [], groupB: [] });
  const [activeTab, setActiveTab] = useState('live');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const fetchData = async (silent = false) => {
    if (!silent) setSyncing(true);
    const [live, all, stand] = await Promise.all([
      api.get('/matches/live'), api.get('/matches'), api.get('/standings'),
    ]);
    setLiveMatches(Array.isArray(live) ? live : []);
    setAllMatches(Array.isArray(all) ? all : []);
    setStandings(stand.groupA ? stand : { groupA: [], groupB: [] });
    setLoading(false);
    setLastUpdated(new Date());
    setSyncing(false);
  };

  useEffect(() => {
    fetchData();
    // Poll every 4 seconds for near-real-time updates
    const i = setInterval(() => fetchData(true), 4000);
    return () => clearInterval(i);
  }, []);

  const completed = allMatches.filter((m) => m.status === 'completed');
  const upcoming = allMatches.filter((m) => m.status === 'scheduled');

  const tabs = [
    { 
      id: 'live', 
      label: 'Live', 
      count: liveMatches.length, 
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    },
    { 
      id: 'upcoming', 
      label: 'Upcoming', 
      count: upcoming.length, 
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    },
    { 
      id: 'results', 
      label: 'Results', 
      count: completed.length, 
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><polyline points="9 12 11 14 15 10"/></svg>
    },
    { 
      id: 'standings', 
      label: 'Standings', 
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Hero Header - PREMIUM */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl p-6 md:p-8 overflow-hidden transition-all duration-500"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          {/* Animated Background Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute -top-20 -left-20 w-60 h-60 bg-gradient-radial from-yellow-500/20 via-yellow-500/5 to-transparent rounded-full blur-3xl"
          />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center gap-5">
            {/* Logo with badge */}
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="relative shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-20 h-20 rounded-2xl bg-linear-to-br from-yellow-500/30 to-yellow-600/10 border-2 border-yellow-500/40 flex items-center justify-center p-2 backdrop-blur-sm shadow-lg shadow-yellow-500/20"
              >
                <Image src="/logo.png" alt="APL Logo" width={72} height={72} className="object-contain" />
              </motion.div>
              {liveMatches.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.4 }}
                  style={{ position: 'absolute', top: -8, right: -8, minWidth: 22, height: 22, padding: '0 5px', borderRadius: 11, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#fff', border: '2px solid var(--bg-card)' }}
                >
                  {liveMatches.length}
                </motion.div>
              )}
            </motion.div>
            
            <div className="flex-1 text-center md:text-left">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-black leading-none tracking-tight font-inter"
                style={{ color: 'var(--text-primary)' }}
              >
                APL <span style={{ color: 'var(--gold)' }}>SCOREBOARD</span>
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 13, color: 'var(--text-muted)', justifyContent: 'center' }}
                className="md:justify-start"
              >
                {liveMatches.length > 0 ? (
                  <>
                    <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                      style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 6px #ef4444' }} />
                    <span>{liveMatches.length} match{liveMatches.length !== 1 ? 'es' : ''} live right now</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    <span>No live matches</span>
                  </>
                )}
              </motion.div>
            </div>

            {liveMatches.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 100, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)' }}>
                  <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 8px #ef4444' }} />
                  <span style={{ fontSize: 12, fontWeight: 900, color: '#ef4444', letterSpacing: '0.12em', fontFamily: 'var(--font-bebas)' }}>LIVE</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                  <motion.span animate={{ opacity: syncing ? [1, 0.3, 1] : 1 }} transition={{ duration: 0.8, repeat: syncing ? Infinity : 0 }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                  <span>{syncing ? 'Syncing...' : lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''}</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', border: 'none', transition: 'all .2s',
                background: active ? 'var(--gold)' : 'var(--bg-card)',
                color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
                boxShadow: active ? '0 4px 16px rgba(201,162,39,0.2)' : 'none',
                outline: !active ? '1px solid var(--border-subtle)' : 'none',
              }}>
                {tab.icon}
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 800, minWidth: 18, height: 18,
                    borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: active ? 'rgba(6,14,26,0.25)' : 'var(--bg-elevated)',
                    color: active ? 'var(--bg-primary)' : 'var(--text-muted)',
                    padding: '0 5px',
                  }}>{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--border-default)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <>
            {activeTab === 'live' && <Section matches={liveMatches} emptyText="No live matches right now" emptySub="Matches will appear here when they start" />}
            {activeTab === 'upcoming' && <Section matches={upcoming} emptyText="No upcoming matches" emptySub="Check back later for scheduled fixtures" />}
            {activeTab === 'results' && <Section matches={completed} emptyText="No results yet" emptySub="Completed matches will appear here" />}
            {activeTab === 'standings' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px,1fr))', gap: 20 }}>
                <StandingsTable teams={standings.groupA} groupName="A" />
                <StandingsTable teams={standings.groupB} groupName="B" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ matches, emptyText, emptySub }) {
  if (!matches || matches.length === 0) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '60px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{emptyText}</p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{emptySub}</p>
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
      {matches.map(m => <MatchCard key={m._id} match={m} />)}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border-default)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Loading matches...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
