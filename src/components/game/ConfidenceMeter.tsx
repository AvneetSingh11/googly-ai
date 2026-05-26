'use client';

import { motion } from 'framer-motion';
import { cn, getConfidenceLabel } from '@/utils/helpers';

interface ConfidenceMeterProps {
  confidence: number;
  animated?: boolean;
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 85) return '#39FF14';
  if (confidence >= 65) return '#7CFF4A';
  if (confidence >= 45) return '#FFD700';
  if (confidence >= 25) return '#FFB800';
  return '#4A9EFF';
}

function getConfidenceGlow(confidence: number): string {
  if (confidence >= 80) return '0 0 12px rgba(57, 255, 20, 0.5), 0 0 24px rgba(57, 255, 20, 0.2)';
  if (confidence >= 60) return '0 0 8px rgba(124, 255, 74, 0.3)';
  return 'none';
}

export default function ConfidenceMeter({
  confidence,
  animated = true,
}: ConfidenceMeterProps) {
  const color = getConfidenceColor(confidence);
  const glow = getConfidenceGlow(confidence);
  const label = getConfidenceLabel(confidence);
  const clampedConfidence = Math.min(100, Math.max(0, confidence));

  return (
    <div className="w-full space-y-2">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
          Confidence
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] md:text-xs font-medium text-white/40 hidden sm:block">
            {label}
          </span>
          <motion.span
            className="text-sm md:text-base font-bold tabular-nums"
            style={{ color }}
            key={clampedConfidence}
            initial={animated ? { scale: 1.3, opacity: 0.7 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {clampedConfidence}%
          </motion.span>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            clampedConfidence >= 80 && 'animate-[glow-pulse_2s_ease-in-out_infinite]'
          )}
          style={{
            backgroundColor: color,
            boxShadow: glow,
          }}
          initial={animated ? { width: '0%' } : { width: `${clampedConfidence}%` }}
          animate={{ width: `${clampedConfidence}%` }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
            mass: 0.8,
          }}
        />
      </div>
    </div>
  );
}
