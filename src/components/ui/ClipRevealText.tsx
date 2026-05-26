'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';

interface ClipRevealTextProps {
  text: string | string[];
  className?: string;
  delay?: number;
  stagger?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export default function ClipRevealText({
  text,
  className,
  delay = 0,
  stagger = 0.12,
  as: Tag = 'h1',
}: ClipRevealTextProps) {
  const lines = Array.isArray(text) ? text : [text];

  return (
    <Tag className={cn('flex flex-col', className)}>
      {lines.map((line, i) => (
        <span
          key={`${line}-${i}`}
          className="block overflow-hidden"
        >
          <motion.span
            className="block"
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: delay + i * stagger,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
