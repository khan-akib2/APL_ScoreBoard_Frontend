'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import UserLayout from '@/components/UserLayout';
import StandingsTable from '@/components/StandingsTable';
import { api } from '@/services/api';

export default function StandingsPage() {
  const [standings, setStandings] = useState({ groupA: [], groupB: [] });

  useEffect(() => {
    api.get('/standings').then((data) => {
      if (data.groupA) setStandings(data);
    });
  }, []);

  return (
    <UserLayout>
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 32, letterSpacing: '-0.02em' }}>
            <span style={{ color: 'var(--gold)' }}>GROUP STANDINGS</span>
          </h1>
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <StandingsTable teams={standings.groupA} groupName="A" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <StandingsTable teams={standings.groupB} groupName="B" />
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ marginTop: 24, borderRadius: 12, padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', fontSize: 13, color: 'var(--text-muted)' }}
          >
            <p>P = Played · W = Won · L = Lost · Pts = Points · NRR = Net Run Rate</p>
          </motion.div>
        </div>
      </div>
    </UserLayout>
  );
}
