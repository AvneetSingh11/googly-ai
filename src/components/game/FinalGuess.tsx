'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClipRevealText from '@/components/ui/ClipRevealText';
import NeonButton from '@/components/ui/NeonButton';
import GlassCard from '@/components/ui/GlassCard';
import { cn, getConfidenceLabel } from '@/utils/helpers';
import { Sparkles, X, Trophy, Frown } from 'lucide-react';

interface FinalGuessProps {
  guess: string;
  confidence: number;
  category: string;
  onConfirm: (correct: boolean) => void;
}

export default function FinalGuess({
  guess,
  confidence,
  category,
  onConfirm,
}: FinalGuessProps) {
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [animatedConfidence, setAnimatedConfidence] = useState(0);

  // Animate confidence counter
  useState(() => {
    let frame: number;
    let start = 0;
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedConfidence(Math.round(eased * confidence));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  });

  const handleConfirm = (correct: boolean) => {
    setResult(correct ? 'correct' : 'wrong');
    setTimeout(() => onConfirm(correct), 1500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Result overlay */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 flex items-center justify-center"
            >
              {result === 'correct' ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="text-center"
                >
                  <Trophy className="w-24 h-24 text-accent-gold mx-auto mb-6" />
                  <h2 className="text-4xl md:text-6xl font-bold text-accent-gold uppercase tracking-wider">
                    Nailed It!
                  </h2>
                  <p className="text-white/60 mt-4 text-lg">The machine wins this round.</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="text-center"
                >
                  <Frown className="w-24 h-24 text-danger mx-auto mb-6" />
                  <h2 className="text-4xl md:text-6xl font-bold text-white uppercase tracking-wider">
                    You Beat
                  </h2>
                  <h2 className="text-4xl md:text-6xl font-bold text-danger uppercase tracking-wider">
                    The Machine
                  </h2>
                  <p className="text-white/60 mt-4 text-lg">Well played, human.</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main card */}
        {!result && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-lg"
          >
            <GlassCard
              className={cn(
                'p-8 md:p-10',
                'border-accent-green/30',
                'shadow-[0_0_40px_rgba(57,255,20,0.15),0_0_80px_rgba(57,255,20,0.05)]'
              )}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 mb-6"
              >
                <Sparkles className="w-5 h-5 text-accent-green" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent-green">
                  Final Answer — {category}
                </span>
              </motion.div>

              {/* Dramatic text */}
              <div className="mb-6">
                <ClipRevealText
                  text="I'm locking this in."
                  as="p"
                  delay={0.3}
                  className="text-lg md:text-xl font-semibold text-white/60 uppercase tracking-wider"
                />
              </div>

              {/* The guess */}
              <div className="mb-8">
                <ClipRevealText
                  text={guess}
                  as="h2"
                  delay={0.6}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"
                />
              </div>

              {/* Confidence counter */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex items-center gap-4 mb-10"
              >
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl md:text-5xl font-bold tabular-nums text-accent-green">
                    {animatedConfidence}
                  </span>
                  <span className="text-xl text-accent-green/60 font-bold">%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                    Confidence
                  </span>
                  <span className="text-xs text-white/25">
                    {getConfidenceLabel(confidence)}
                  </span>
                </div>
              </motion.div>

              {/* Confirm buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <NeonButton
                  id="confirm-correct"
                  variant="green"
                  size="lg"
                  fullWidth
                  onClick={() => handleConfirm(true)}
                >
                  Yes, you got it! 🎉
                </NeonButton>
                <NeonButton
                  id="confirm-wrong"
                  variant="red"
                  size="lg"
                  fullWidth
                  onClick={() => handleConfirm(false)}
                >
                  Nope, wrong! 😏
                </NeonButton>
              </motion.div>
            </GlassCard>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
