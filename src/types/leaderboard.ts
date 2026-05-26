// ─── Leaderboard Types ──────────────────────────────────────────────────────

export interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  category: 'player' | 'team' | 'match';
  turnsUsed: number;
  wasGuessedCorrectly: boolean;
  entityName: string;
  completedAt: number;
  streak: number;
}

export interface PlayerStats {
  userId: string;
  displayName: string;
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  averageTurns: number;
  bestStreak: number;
  currentStreak: number;
  favoriteCategory: 'player' | 'team' | 'match';
  lastPlayedAt: number;
}

export interface LeaderboardFilters {
  category?: 'player' | 'team' | 'match' | 'all';
  timeRange?: 'today' | 'week' | 'month' | 'all_time';
  limit?: number;
}
