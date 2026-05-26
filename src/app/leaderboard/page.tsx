'use client';

import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import ClipRevealText from '@/components/ui/ClipRevealText';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import NeonButton from '@/components/ui/NeonButton';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/helpers';
import { Loader2, RefreshCw } from 'lucide-react';

const tabs = [
  { id: 'wins' as const, label: 'Wins' },
  { id: 'streak' as const, label: 'Streaks' },
  { id: 'fastest' as const, label: 'Fastest' },
];

const cinematicEase = [0.22, 1, 0.36, 1] as const;

export default function LeaderboardPage() {
  const { entries, loading, sortBy, setSortBy, refresh } = useLeaderboard();
  const { user } = useAuth();

  return (
    <main className="relative min-h-screen flex flex-col bg-primary">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 30% 0%, rgba(57, 255, 20, 0.05) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 100%, rgba(94, 14, 215, 0.04) 0%, transparent 40%),
              #0A0A0A
            `,
          }}
        />
      </div>

      <Header />

      <div className="relative z-10 flex-1 flex flex-col px-5 md:px-8 lg:px-12 pt-28 md:pt-32 pb-12 max-w-4xl mx-auto w-full">
        {/* Heading */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <ClipRevealText
              text="LEADERBOARD"
              as="h1"
              delay={0.2}
              className="section-text text-white"
            />
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: cinematicEase, delay: 0.4 }}
              className="mt-3 text-sm text-white/40 font-medium"
            >
              The greatest minds in cricket trivia.
            </motion.p>
          </div>

          {/* Refresh button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <NeonButton
              id="refresh-leaderboard"
              variant="white"
              size="sm"
              onClick={refresh}
              loading={loading}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </NeonButton>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: cinematicEase, delay: 0.3 }}
          className="flex items-center gap-1 mb-8 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSortBy(tab.id)}
              className={cn(
                'px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer',
                sortBy === tab.id
                  ? 'bg-accent-green/10 text-accent-green border border-accent-green/20 shadow-[0_0_12px_rgba(57,255,20,0.1)]'
                  : 'text-white/40 hover:text-white/60 border border-transparent'
              )}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Table */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-8 h-8 text-accent-green animate-spin" />
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
                Loading rankings...
              </p>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <LeaderboardTable
              entries={entries}
              currentUserId={user?.uid}
            />
          </motion.div>
        )}
      </div>
    </main>
  );
}
