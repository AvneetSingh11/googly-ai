'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import VideoBackground from '@/components/ui/VideoBackground';
import ClipRevealText from '@/components/ui/ClipRevealText';
import CategoryCard from '@/components/ui/CategoryCard';
import NeonButton from '@/components/ui/NeonButton';
import { generateGameId } from '@/utils/helpers';
import type { GameCategory } from '@/types/game';

const categories: {
  id: GameCategory;
  icon: string;
  title: string;
  description: string;
}[] = [
  {
    id: 'player',
    icon: '🏏',
    title: 'Player',
    description:
      'Think of any IPL cricketer — past or present. Batsman, bowler, all-rounder — bring it on.',
  },
  {
    id: 'team',
    icon: '🏟️',
    title: 'Team',
    description:
      'Pick an IPL franchise. From the originals to the newcomers. Can I figure out which one?',
  },
  {
    id: 'match',
    icon: '🏆',
    title: 'Match',
    description:
      'Remember a legendary IPL match? Finals, super overs, last-ball thrillers — challenge me.',
  },
];

const cinematicEase = [0.22, 1, 0.36, 1] as const;

export default function PlayPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | null>(null);

  const handleStart = () => {
    if (!selectedCategory) return;
    const gameId = generateGameId();
    router.push(`/play/${gameId}?category=${selectedCategory}`);
  };

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      <VideoBackground variant="dark" overlayOpacity={0.7} />
      <Header />

      <div className="relative z-10 flex-1 flex flex-col px-5 md:px-8 lg:px-12 pt-28 md:pt-32 pb-12 max-w-6xl mx-auto w-full">
        {/* Heading */}
        <div className="mb-12 md:mb-16">
          <ClipRevealText
            text={['CHOOSE YOUR', 'CHALLENGE']}
            as="h1"
            delay={0.2}
            stagger={0.12}
            className="section-text text-white"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: cinematicEase, delay: 0.5 }}
            className="mt-4 text-sm md:text-base text-white/40 font-medium max-w-md"
          >
            Select a category and think of something. I&apos;ll try to read your mind.
          </motion.p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: cinematicEase,
                delay: 0.4 + i * 0.12,
              }}
            >
              <CategoryCard
                icon={cat.icon}
                title={cat.title}
                description={cat.description}
                selected={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Start button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: cinematicEase, delay: 0.9 }}
          className="flex justify-center md:justify-end"
        >
          <NeonButton
            id="start-game"
            variant="green"
            size="lg"
            disabled={!selectedCategory}
            onClick={handleStart}
          >
            {selectedCategory ? 'Begin the challenge →' : 'Select a category'}
          </NeonButton>
        </motion.div>
      </div>
    </main>
  );
}
