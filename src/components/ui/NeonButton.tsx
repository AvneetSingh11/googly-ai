'use client';

import { type ReactNode, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/helpers';

type ButtonVariant = 'green' | 'red' | 'amber' | 'purple' | 'white';
type ButtonSize = 'sm' | 'md' | 'lg';

interface NeonButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, {
  base: string;
  hover: string;
  glow: string;
}> = {
  green: {
    base: 'bg-accent-green/10 text-accent-green border-accent-green/40',
    hover: 'hover:bg-accent-green/20 hover:border-accent-green/70',
    glow: 'hover:shadow-[0_0_20px_rgba(57,255,20,0.3),0_0_40px_rgba(57,255,20,0.1)]',
  },
  red: {
    base: 'bg-danger/10 text-danger border-danger/40',
    hover: 'hover:bg-danger/20 hover:border-danger/70',
    glow: 'hover:shadow-[0_0_20px_rgba(255,59,59,0.3),0_0_40px_rgba(255,59,59,0.1)]',
  },
  amber: {
    base: 'bg-warning/10 text-warning border-warning/40',
    hover: 'hover:bg-warning/20 hover:border-warning/70',
    glow: 'hover:shadow-[0_0_20px_rgba(255,184,0,0.3),0_0_40px_rgba(255,184,0,0.1)]',
  },
  purple: {
    base: 'bg-accent-purple/10 text-accent-purple border-accent-purple/40',
    hover: 'hover:bg-accent-purple/20 hover:border-accent-purple/70',
    glow: 'hover:shadow-[0_0_20px_rgba(94,14,215,0.3),0_0_40px_rgba(94,14,215,0.1)]',
  },
  white: {
    base: 'bg-white/5 text-white border-white/20',
    hover: 'hover:bg-white/10 hover:border-white/40',
    glow: 'hover:shadow-[0_0_20px_rgba(255,255,255,0.1),0_0_40px_rgba(255,255,255,0.05)]',
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs tracking-widest',
  md: 'px-6 py-3 text-sm tracking-widest',
  lg: 'px-8 py-4 text-base tracking-widest',
};

export default function NeonButton({
  children,
  variant = 'green',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className,
  onClick,
  ...rest
}: NeonButtonProps) {
  const styles = variantStyles[variant];

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'font-semibold uppercase border rounded-xl',
        'transition-all duration-300 ease-out',
        'cursor-pointer select-none',
        sizeStyles[size],
        styles.base,
        !disabled && styles.hover,
        !disabled && styles.glow,
        disabled && 'opacity-40 cursor-not-allowed',
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      {children}
    </motion.button>
  );
}
