'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import VideoBackground from '@/components/ui/VideoBackground';
import ClipRevealText from '@/components/ui/ClipRevealText';

const stats = [
  { value: '15', label: 'Questions' },
  { value: '500+', label: 'Players' },
  { value: '1000+', label: 'Games' },
];

const cinematicEase = [0.22, 1, 0.36, 1] as const;

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      <VideoBackground variant="hero" overlayOpacity={0.5} />
      <Header />

      {/* Content layer */}
      <div className="relative z-10 flex-1 flex flex-col justify-between px-5 md:px-8 lg:px-12 pt-24 pb-8 max-w-7xl mx-auto w-full">
        {/* Top spacer on mobile */}
        <div className="flex-1 min-h-[10vh]" />

        {/* Center: Hero heading */}
        <div className="flex-shrink-0">
          <ClipRevealText
            text={['OUTSMART', 'THE', 'MACHINE']}
            as="h1"
            delay={0.4}
            stagger={0.12}
            className="hero-text text-white leading-[0.88] tracking-tight"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-[5vh]" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 md:gap-12">
          {/* Left: Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: cinematicEase, delay: 0.9 }}
            className="flex flex-col gap-1 order-2 md:order-1"
          >
            <p className="text-sm md:text-base text-white/50 font-medium leading-relaxed">
              Think of an IPL legend.
            </p>
            <p className="text-sm md:text-base text-white/50 font-medium leading-relaxed">
              I&apos;ll guess who.
            </p>
            <p className="text-sm md:text-base text-white/70 font-semibold leading-relaxed">
              15 questions.
            </p>
          </motion.div>

          {/* Right side: Stats + CTA */}
          <div className="flex flex-col items-end gap-8 order-1 md:order-2">
            {/* Stats */}
            <div className="flex items-center gap-6 md:gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: cinematicEase,
                    delay: 0.7 + i * 0.1,
                  }}
                  className="text-right"
                >
                  <div className="text-lg md:text-xl font-bold text-white tabular-nums">
                    +{stat.value}
                  </div>
                  <div className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.15em] text-white/30">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: cinematicEase, delay: 1.1 }}
            >
              <Link href="/play">
                <motion.div
                  whileHover={{ scale: 1.03, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center gap-3 px-7 py-4 rounded-xl bg-accent-green/10 border border-accent-green/30 text-accent-green cursor-pointer transition-all duration-300 hover:bg-accent-green/15 hover:border-accent-green/50 hover:shadow-[0_0_30px_rgba(57,255,20,0.15)]"
                >
                  <span className="text-sm font-bold uppercase tracking-[0.15em]">
                    Start Game
                  </span>
                  <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: cinematicEase, delay: 1.3 }}
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-green/30 to-transparent origin-left"
      />
    </main>
  );
}
