'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';

interface QuestionCounterProps {
  current: number;
  total?: number;
}

export default function QuestionCounter({
  current,
  total = 15,
}: QuestionCounterProps) {
  const isUrgent = current >= 12;
  const progress = current / total;

  return (
    <div className="flex flex-col items-start gap-2">
      {/* Big counter */}
      <div className="flex items-baseline gap-1">
        <motion.span
          key={current}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'text-2xl md:text-3xl font-bold tabular-nums leading-none',
            isUrgent ? 'text-danger' : 'text-white'
          )}
        >
          {current.toString().padStart(2, '0')}
        </motion.span>
        <span className="text-lg md:text-xl font-light text-white/20 tabular-nums leading-none">
          / {total.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1">
        {Array.from({ length: total }, (_, i) => (
          <motion.div
            key={i}
            className={cn(
              'w-1.5 h-1.5 rounded-full transition-colors duration-300',
              i < current
                ? isUrgent && i >= 11
                  ? 'bg-danger'
                  : 'bg-accent-green'
                : 'bg-white/10'
            )}
            initial={i === current - 1 ? { scale: 0 } : false}
            animate={i === current - 1 ? { scale: 1 } : undefined}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            style={
              isUrgent && i < current && i >= 11
                ? { boxShadow: '0 0 6px rgba(255,59,59,0.5)' }
                : i < current
                ? { boxShadow: '0 0 4px rgba(57,255,20,0.3)' }
                : undefined
            }
          />
        ))}
      </div>

      {/* Urgent label */}
      {isUrgent && (
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[9px] font-bold uppercase tracking-[0.2em] text-danger"
        >
          Running out of questions
        </motion.span>
      )}
    </div>
  );
}
