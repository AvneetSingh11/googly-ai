'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-[200px] self-start"
    >
      <GlassCard className="px-5 py-3.5 rounded-2xl rounded-tl-md border-l-[3px] border-l-accent-green/40">
        <div className="flex items-center gap-3">
          {/* Bouncing dots */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-accent-green/60"
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Label */}
          <span className="text-[10px] font-medium text-white/30 uppercase tracking-[0.1em]">
            Thinking
          </span>
        </div>
      </GlassCard>
    </motion.div>
  );
}
