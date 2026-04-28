'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/api';

/**
 * Fetch and optionally poll a single match by ID.
 * @param {string} id - match ID
 * @param {number|null} pollInterval - ms between polls, null = no polling
 */
export function useMatch(id, pollInterval = null) {
  const [match, setMatch]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    const data = await api.get(`/matches/${id}`);
    if (data._id) {
      setMatch(data);
      setError(null);
    } else {
      setError(data.message || 'Failed to load match');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetch();
    if (!pollInterval) return;
    const interval = setInterval(fetch, pollInterval);
    return () => clearInterval(interval);
  }, [fetch, pollInterval]);

  return { match, setMatch, loading, error, refetch: fetch };
}
