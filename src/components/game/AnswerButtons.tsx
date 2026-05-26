'use client';

import { motion } from 'framer-motion';
import NeonButton from '@/components/ui/NeonButton';
import type { Answer } from '@/types/game';

interface AnswerButtonsProps {
  onAnswer: (answer: Answer) => void;
  disabled?: boolean;
}

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const buttonVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function AnswerButtons({
  onAnswer,
  disabled = false,
}: AnswerButtonsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="flex items-center gap-3 w-full"
    >
      <motion.div variants={buttonVariants} className="flex-1">
        <NeonButton
          id="answer-yes"
          variant="green"
          size="lg"
          fullWidth
          disabled={disabled}
          onClick={() => onAnswer('yes')}
        >
          Yes
        </NeonButton>
      </motion.div>

      <motion.div variants={buttonVariants} className="flex-1">
        <NeonButton
          id="answer-no"
          variant="red"
          size="lg"
          fullWidth
          disabled={disabled}
          onClick={() => onAnswer('no')}
        >
          No
        </NeonButton>
      </motion.div>

      <motion.div variants={buttonVariants} className="flex-1">
        <NeonButton
          id="answer-unsure"
          variant="amber"
          size="lg"
          fullWidth
          disabled={disabled}
          onClick={() => onAnswer('unsure')}
        >
          Don&apos;t Know
        </NeonButton>
      </motion.div>
    </motion.div>
  );
}
