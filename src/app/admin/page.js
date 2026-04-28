'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import { api } from '@/services/api';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ teams: 0, players: 0, matches: 0, live: 0 });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([api.get('/teams'), api.get('/players'), api.get('/matches')]).then(([teams, players, matches]) => {
      setStats({
        teams: Array.isArray(teams) ? teams.length : 0,
        players: Array.isArray(players) ? players.length : 0,
        matches: Array.isArray(matches) ? matches.length : 0,
        live: Array.isArray(matches) ? matches.filter(x => x.status === 'live').length : 0,
      });
    });
  }, [user]);

  if (loading || !user) return null;

  const statCards = [
    { label: 'Teams', value: stats.teams, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label: 'Players', value: stats.players, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { label: 'Matches', value: stats.matches, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
    { label: 'Live Now', value: stats.live, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stats.live > 0 ? 'var(--red)' : 'var(--text-muted)'} strokeWidth="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  ];

  const actions = [
    { href: '/admin/matches', label: 'Manage Matches', sub: 'Score & complete matches', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
    { href: '/admin/schedule', label: 'Generate Schedule', sub: 'Create fixtures & knockouts', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { href: '/admin/teams', label: 'Manage Teams', sub: 'Add/edit teams across groups', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { href: '/admin/players', label: 'Manage Players', sub: 'Add up to 7 players per team', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-linear-to-br from-[#0a0e1a] via-[#0d1117] to-[#080c14] p-4 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-black text-white mb-2 tracking-wider font-bebas">
            ADMIN <span className="text-yellow-500">DASHBOARD</span>
          </h1>
          <p className="text-gray-400 text-sm mb-8 font-inter font-medium">Live tournament overview & quick actions</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, index) => (
            <motion.div 
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative bg-linear-to-br from-[#1a1f2e] to-[#0f1419] border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10 overflow-hidden"
            >
              <motion.div 
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.div 
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="w-12 h-12 rounded-xl bg-linear-to-br from-yellow-500/30 to-yellow-600/10 border-2 border-yellow-500/40 flex items-center justify-center backdrop-blur-sm"
                  >
                    {s.icon}
                  </motion.div>
                  {s.label === 'Live Now' && stats.live > 0 && (
                    <motion.span 
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"
                    />
                  )}
                </div>
                <motion.p 
                  key={s.value}
                  initial={{ scale: 1.2, color: '#FFD700' }}
                  animate={{ scale: 1, color: '#FFFFFF' }}
                  transition={{ duration: 0.3 }}
                  className="text-6xl font-black leading-none font-bebas"
                >
                  {s.value}
                </motion.p>
                <p className="text-gray-500 text-xs font-bold tracking-widest mt-3 uppercase font-inter">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions — mobile only */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="sm:hidden text-gray-500 text-xs font-bold tracking-widest mb-4 uppercase font-inter"
        >
          QUICK ACTIONS
        </motion.p>
        <div className="sm:hidden grid grid-cols-1 gap-4">
          {actions.map((a, index) => (
            <Link key={a.href} href={a.href}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="relative bg-linear-to-br from-[#1a1f2e] to-[#0f1419] border border-yellow-500/20 rounded-2xl p-6 hover:border-yellow-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10 cursor-pointer overflow-hidden"
              >
                <motion.div 
                  animate={{ opacity: [0.05, 0.15, 0.05] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl"
                />
                <div className="relative z-10 flex items-center gap-4">
                  <motion.div 
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="w-12 h-12 rounded-xl bg-linear-to-br from-yellow-500/30 to-yellow-600/10 border-2 border-yellow-500/40 flex items-center justify-center backdrop-blur-sm shrink-0"
                  >
                    {a.icon}
                  </motion.div>
                  <div className="min-w-0">
                    <p className="text-yellow-500 text-base font-black mb-1 font-bebas tracking-wider">{a.label} →</p>
                    <p className="text-gray-400 text-sm font-inter font-medium">{a.sub}</p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
