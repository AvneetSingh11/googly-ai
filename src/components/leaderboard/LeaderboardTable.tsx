'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { cn, formatTime } from '@/utils/helpers';

interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  wins: number;
  streak: number;
  fastestTime: number;
  gamesPlayed: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const trophies = ['🥇', '🥈', '🥉'];

const rowVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      delay: i * 0.06,
    },
  }),
};

export default function LeaderboardTable({
  entries,
  currentUserId,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-white/30 text-sm uppercase tracking-widest">
          No entries yet. Be the first to play!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      {/* Table header */}
      <div className="grid grid-cols-[3rem_1fr_4.5rem_4.5rem_5rem] md:grid-cols-[4rem_1fr_6rem_6rem_6rem] gap-2 px-4 md:px-6 py-3 text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] text-white/30 border-b border-white/5 min-w-[400px]">
        <span>Rank</span>
        <span>Player</span>
        <span className="text-right">Wins</span>
        <span className="text-right">Streak</span>
        <span className="text-right">Fastest</span>
      </div>

      {/* Table rows */}
      <div className="space-y-1.5 pt-2 min-w-[400px]">
        {entries.map((entry, i) => {
          const isCurrentUser = entry.userId === currentUserId;
          const isTopThree = i < 3;

          return (
            <motion.div
              key={entry.id}
              custom={i}
              variants={rowVariants}
              initial="initial"
              animate="animate"
            >
              <GlassCard
                className={cn(
                  'grid grid-cols-[3rem_1fr_4.5rem_4.5rem_5rem] md:grid-cols-[4rem_1fr_6rem_6rem_6rem] gap-2',
                  'items-center px-4 md:px-6 py-3.5',
                  'transition-all duration-300 hover:bg-white/[0.04]',
                  isCurrentUser && 'border-accent-green/40 bg-accent-green/[0.04] shadow-[0_0_20px_rgba(57,255,20,0.08)]',
                  isTopThree && !isCurrentUser && 'border-white/[0.06]'
                )}
              >
                {/* Rank */}
                <span className="text-base md:text-lg font-bold tabular-nums">
                  {isTopThree ? (
                    <span className="text-xl">{trophies[i]}</span>
                  ) : (
                    <span className="text-white/40">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                  )}
                </span>

                {/* Player */}
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      'text-sm md:text-base font-semibold truncate',
                      isCurrentUser ? 'text-accent-green' : 'text-white/90',
                      isTopThree && !isCurrentUser && 'text-white'
                    )}
                  >
                    {entry.displayName}
                  </span>
                  {isCurrentUser && (
                    <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-accent-green/60 bg-accent-green/10 px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>

                {/* Wins */}
                <span className={cn(
                  'text-right text-sm font-bold tabular-nums',
                  isTopThree ? 'text-white' : 'text-white/60'
                )}>
                  {entry.wins}
                </span>

                {/* Streak */}
                <span className={cn(
                  'text-right text-sm font-bold tabular-nums',
                  entry.streak >= 10 ? 'text-accent-gold' : isTopThree ? 'text-white' : 'text-white/60'
                )}>
                  {entry.streak}🔥
                </span>

                {/* Fastest */}
                <span className={cn(
                  'text-right text-sm font-mono tabular-nums',
                  isTopThree ? 'text-white' : 'text-white/60'
                )}>
                  {formatTime(entry.fastestTime)}
                </span>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
