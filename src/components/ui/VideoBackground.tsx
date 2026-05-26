'use client';

import { type ReactNode } from 'react';
import { cn } from '@/utils/helpers';

interface VideoBackgroundProps {
  overlayOpacity?: number;
  children?: ReactNode;
  className?: string;
  variant?: 'hero' | 'dark' | 'subtle';
}

export default function VideoBackground({
  overlayOpacity = 0.7,
  children,
  className,
  variant = 'hero',
}: VideoBackgroundProps) {
  const gradientVariants: Record<string, string> = {
    hero: `
      radial-gradient(ellipse at 15% 10%, rgba(57, 255, 20, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 85% 20%, rgba(94, 14, 215, 0.12) 0%, transparent 45%),
      radial-gradient(ellipse at 50% 80%, rgba(57, 255, 20, 0.06) 0%, transparent 40%),
      radial-gradient(ellipse at 30% 60%, rgba(94, 14, 215, 0.04) 0%, transparent 35%),
      radial-gradient(circle at 70% 90%, rgba(255, 215, 0, 0.04) 0%, transparent 30%)
    `,
    dark: `
      radial-gradient(ellipse at 20% 0%, rgba(57, 255, 20, 0.06) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 10%, rgba(94, 14, 215, 0.05) 0%, transparent 40%)
    `,
    subtle: `
      radial-gradient(ellipse at 50% 0%, rgba(57, 255, 20, 0.04) 0%, transparent 50%)
    `,
  };

  return (
    <div className={cn('fixed inset-0 -z-10 overflow-hidden', className)}>
      {/* Animated gradient background simulating stadium lights */}
      <div
        className="absolute inset-0 animate-[stadium-lights_10s_ease-in-out_infinite]"
        style={{
          backgroundImage: gradientVariants[variant],
          backgroundColor: '#0A0A0A',
        }}
      />

      {/* Moving light beams */}
      <div
        className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] animate-[spin-slow_60s_linear_infinite] opacity-30"
        style={{
          background: `
            conic-gradient(
              from 0deg at 50% 50%,
              transparent 0deg,
              rgba(57, 255, 20, 0.03) 30deg,
              transparent 60deg,
              transparent 120deg,
              rgba(94, 14, 215, 0.03) 150deg,
              transparent 180deg,
              transparent 240deg,
              rgba(57, 255, 20, 0.02) 270deg,
              transparent 300deg,
              transparent 360deg
            )
          `,
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, rgba(10,10,10,${overlayOpacity * 0.3}), rgba(10,10,10,${overlayOpacity}))`,
        }}
      />

      {children}
    </div>
  );
}
