'use client';

import { useState, useEffect, useCallback } from 'react';

interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  wins: number;
  streak: number;
  fastestTime: number;
  gamesPlayed: number;
  lastPlayed: string;
}

type SortField = 'wins' | 'streak' | 'fastest';

// Mock leaderboard data for standalone mode
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', userId: 'u1', displayName: 'CricketMind_42', wins: 47, streak: 12, fastestTime: 34, gamesPlayed: 62, lastPlayed: '2026-05-26' },
  { id: '2', userId: 'u2', displayName: 'IPL_Oracle', wins: 41, streak: 9, fastestTime: 28, gamesPlayed: 55, lastPlayed: '2026-05-26' },
  { id: '3', userId: 'u3', displayName: 'StumpedAI', wins: 38, streak: 15, fastestTime: 41, gamesPlayed: 50, lastPlayed: '2026-05-25' },
  { id: '4', userId: 'u4', displayName: 'SixerKing', wins: 35, streak: 7, fastestTime: 22, gamesPlayed: 48, lastPlayed: '2026-05-25' },
  { id: '5', userId: 'u5', displayName: 'BowlerBrain', wins: 33, streak: 11, fastestTime: 38, gamesPlayed: 45, lastPlayed: '2026-05-24' },
  { id: '6', userId: 'u6', displayName: 'WicketWiz', wins: 29, streak: 6, fastestTime: 31, gamesPlayed: 40, lastPlayed: '2026-05-24' },
  { id: '7', userId: 'u7', displayName: 'SpinMaster', wins: 27, streak: 8, fastestTime: 45, gamesPlayed: 38, lastPlayed: '2026-05-23' },
  { id: '8', userId: 'u8', displayName: 'YorkerPro', wins: 24, streak: 5, fastestTime: 25, gamesPlayed: 35, lastPlayed: '2026-05-23' },
  { id: '9', userId: 'u9', displayName: 'DhoniMode', wins: 22, streak: 4, fastestTime: 52, gamesPlayed: 33, lastPlayed: '2026-05-22' },
  { id: '10', userId: 'u10', displayName: 'BoundaryBot', wins: 19, streak: 3, fastestTime: 33, gamesPlayed: 28, lastPlayed: '2026-05-22' },
];

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortField>('wins');

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with Firebase Firestore fetch
      // import { getLeaderboard } from '@/firebase/firestore';
      // const data = await getLeaderboard(sortBy);
      // setEntries(data);

      // Local fallback with mock data
      await new Promise((resolve) => setTimeout(resolve, 600));

      const sorted = [...MOCK_LEADERBOARD].sort((a, b) => {
        if (sortBy === 'wins') return b.wins - a.wins;
        if (sortBy === 'streak') return b.streak - a.streak;
        if (sortBy === 'fastest') return a.fastestTime - b.fastestTime;
        return 0;
      });

      setEntries(sorted);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    entries,
    loading,
    error,
    sortBy,
    setSortBy,
    refresh: fetchLeaderboard,
  };
}
