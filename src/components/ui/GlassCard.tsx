'use client';

import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/helpers';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  glowColor?: 'green' | 'purple' | 'gold' | 'none';
  noBorder?: boolean;
  as?: 'div' | 'article' | 'section';
}

const glowStyles: Record<string, string> = {
  green: 'shadow-[0_0_30px_rgba(57,255,20,0.1)]',
  purple: 'shadow-[0_0_30px_rgba(94,14,215,0.1)]',
  gold: 'shadow-[0_0_30px_rgba(255,215,0,0.1)]',
  none: '',
};

export default function GlassCard({
  children,
  className,
  glowColor = 'none',
  noBorder = false,
  ...motionProps
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'relative rounded-2xl backdrop-blur-xl',
        'bg-white/[0.03]',
        !noBorder && 'border border-white/[0.08]',
        glowStyles[glowColor],
        className
      )}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
