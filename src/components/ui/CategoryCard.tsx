'use client';

import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { cn } from '@/utils/helpers';

interface CategoryCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  selected?: boolean;
}

const cardVariants = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  hover: { scale: 1.03, y: -4 },
  tap: { scale: 0.98 },
};

export default function CategoryCard({
  icon,
  title,
  description,
  onClick,
  selected = false,
}: CategoryCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <GlassCard
        className={cn(
          'p-8 md:p-10 h-full transition-all duration-500',
          'group relative overflow-hidden',
          selected
            ? 'border-accent-green/60 shadow-[0_0_30px_rgba(57,255,20,0.2)] bg-accent-green/[0.06]'
            : 'hover:border-white/20'
        )}
      >
        {/* Background glow on hover */}
        <div
          className={cn(
            'absolute inset-0 opacity-0 transition-opacity duration-500',
            'bg-gradient-to-br from-accent-green/[0.04] to-transparent',
            'group-hover:opacity-100',
            selected && 'opacity-100'
          )}
        />

        <div className="relative z-10 flex flex-col items-start gap-6">
          {/* Icon */}
          <div className={cn(
            'text-5xl md:text-6xl transition-transform duration-500',
            'group-hover:scale-110',
            selected && 'scale-110'
          )}>
            {icon}
          </div>

          {/* Title */}
          <h3 className={cn(
            'text-xl md:text-2xl font-bold uppercase tracking-wider text-white',
            'transition-colors duration-300',
            selected && 'text-accent-green'
          )}>
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm md:text-base text-white/50 leading-relaxed font-medium">
            {description}
          </p>

          {/* Select indicator */}
          <div className={cn(
            'flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]',
            'transition-all duration-300',
            selected ? 'text-accent-green' : 'text-white/30 group-hover:text-white/60'
          )}>
            <div className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              selected
                ? 'bg-accent-green shadow-[0_0_8px_rgba(57,255,20,0.5)]'
                : 'bg-white/20 group-hover:bg-white/40'
            )} />
            {selected ? 'Selected' : 'Select'}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
