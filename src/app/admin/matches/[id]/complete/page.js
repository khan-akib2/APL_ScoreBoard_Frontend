'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

export default function CompleteMatchPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [match, setMatch] = useState(null);
  const [winnerId, setWinnerId] = useState('');
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/admin/login');
    else api.get(`/matches/${id}`).then((d) => { if (d._id) setMatch(d); });
  }, [loading, user, id]);

  const handleComplete = async (e) => {
    e.preventDefault();
    const res = await api.put(`/matches/${id}/complete`, { winnerId, description });
    if (res._id) { setMsg('Match completed!'); setTimeout(() => router.push('/admin/matches'), 1500); }
    else setMsg(res.message || 'Error');
  };

  if (!match) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#F3C570', borderTopColor: 'transparent' }}></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:px-6 sm:py-8 max-w-md">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: 'rgba(243, 197, 112, 0.1)', border: '1px solid rgba(243, 197, 112, 0.3)', color: '#F3C570' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            COMPLETE MATCH
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#F3C570' }}>Mark Match as Complete</h1>
        </div>

        <div className="rounded-xl p-6 animate-slide-up animate-delay-100" style={{ background: '#112240', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="font-semibold mb-4 text-base" style={{ color: '#ffffff' }}>
            {match.teamA?.name} vs {match.teamB?.name}
          </p>
          
          {msg && (
            <div className="p-3 rounded-lg text-sm mb-4 flex items-center gap-2"
              style={{ background: 'rgba(243, 197, 112, 0.1)', color: '#F3C570', border: '1px solid rgba(243, 197, 112, 0.3)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {msg}
            </div>
          )}

          <form onSubmit={handleComplete} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#8aacbf' }}>Winner</label>
              <select required value={winnerId} onChange={(e) => setWinnerId(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 focus:outline-none text-sm font-semibold"
                style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                <option value="">Select winner</option>
                <option value={match.teamA?._id}>{match.teamA?.name}</option>
                <option value={match.teamB?._id}>{match.teamB?.name}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#8aacbf' }}>Result Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Team A won by 5 wickets"
                className="w-full rounded-lg px-3 py-2.5 focus:outline-none text-sm"
                style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </div>

            <button type="submit"
              className="w-full py-3 rounded-lg font-bold transition-all duration-300 hover:scale-[1.02] mt-6"
              style={{ background: '#c9a227', color: '#0a1628', boxShadow: '0 4px 15px rgba(243, 197, 112, 0.3)' }}>
              Mark as Completed
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
