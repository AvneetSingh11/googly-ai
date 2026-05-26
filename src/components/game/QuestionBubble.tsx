'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { cn, getPersonaDisplayName } from '@/utils/helpers';
import type { PersonaMode } from '@/types/game';

interface QuestionBubbleProps {
  message: string;
  personaMode?: PersonaMode;
  index: number;
}

const personaBorderColors: Record<string, string> = {
  analyst: 'border-l-accent-green',
  entertainer: 'border-l-accent-purple',
  cocky: 'border-l-accent-gold',
  panicked: 'border-l-danger',
  dramatic: 'border-l-white',
};

const personaBadgeColors: Record<string, string> = {
  analyst: 'bg-accent-green/10 text-accent-green',
  entertainer: 'bg-accent-purple/10 text-accent-purple',
  cocky: 'bg-accent-gold/10 text-accent-gold',
  panicked: 'bg-danger/10 text-danger',
  dramatic: 'bg-white/10 text-white',
};

export default function QuestionBubble({
  message,
  personaMode = 'analyst',
  index,
}: QuestionBubbleProps) {
  const borderColor = personaBorderColors[personaMode] || personaBorderColors.analyst;
  const badgeColor = personaBadgeColors[personaMode] || personaBadgeColors.analyst;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.05,
      }}
      className="max-w-[85%] md:max-w-[75%] self-start"
    >
      <GlassCard
        className={cn(
          'px-5 py-4 border-l-[3px] rounded-2xl rounded-tl-md',
          borderColor
        )}
      >
        {/* Persona badge */}
        <div className="mb-2">
          <span className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]',
            badgeColor
          )}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-[glow-pulse_2s_ease-in-out_infinite]" />
            {getPersonaDisplayName(personaMode)}
          </span>
        </div>

        {/* Message */}
        <p className="text-[15px] md:text-base text-white/90 leading-relaxed font-normal">
          {message}
        </p>
      </GlassCard>
    </motion.div>
  );
}
