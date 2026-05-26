'use client';

import { useEffect, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Timer, Zap } from 'lucide-react';
import Link from 'next/link';
import { useGame } from '@/hooks/useGame';
import ChatHistory from '@/components/game/ChatHistory';
import AnswerButtons from '@/components/game/AnswerButtons';
import QuestionCounter from '@/components/game/QuestionCounter';
import ConfidenceMeter from '@/components/game/ConfidenceMeter';
import FinalGuess from '@/components/game/FinalGuess';
import { formatTime } from '@/utils/helpers';
import type { GameCategory, Answer } from '@/types/game';

const cinematicEase = [0.22, 1, 0.36, 1] as const;

export default function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = (searchParams.get('category') as GameCategory) || 'player';

  const {
    state,
    messages,
    questionNumber,
    confidence,
    guess,
    elapsedTime,
    loading,
    startGame,
    submitAnswer,
    confirmGuess,
    resetGame,
  } = useGame();

  // Start game on mount
  useEffect(() => {
    if (gameId && state === 'idle') {
      startGame(category, gameId);
    }
  }, [gameId, category, state, startGame]);

  const handleAnswer = (answer: Answer) => {
    if (!loading) {
      submitAnswer(answer);
    }
  };

  const handleConfirmGuess = (correct: boolean) => {
    confirmGuess(correct);
  };

  const handlePlayAgain = () => {
    resetGame();
    router.push('/play');
  };

  const isGameOver = state === 'won' || state === 'lost';
  const isGuessing = state === 'guessing' && guess;

  return (
    <main className="relative min-h-screen flex flex-col bg-primary">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 0%, rgba(57, 255, 20, 0.04) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 100%, rgba(94, 14, 215, 0.03) 0%, transparent 40%),
              #0A0A0A
            `,
          }}
        />
      </div>

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: cinematicEase }}
        className="sticky top-0 z-30 bg-primary/80 backdrop-blur-xl border-b border-white/[0.06]"
      >
        <div className="px-4 md:px-6 py-3 max-w-3xl mx-auto w-full">
          {/* Back + Timer row */}
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/play"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>

            <div className="flex items-center gap-1.5 text-white/40">
              <Timer className="w-3.5 h-3.5" />
              <span className="text-xs font-mono font-bold tabular-nums tracking-wider">
                {formatTime(elapsedTime)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-accent-green/70">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {category}
              </span>
            </div>
          </div>

          {/* Counter + Confidence */}
          <div className="flex items-end gap-6">
            <QuestionCounter current={questionNumber} total={15} />
            <div className="flex-1">
              <ConfidenceMeter confidence={confidence} animated />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat area */}
      <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col min-h-0">
        <ChatHistory messages={messages} loading={loading} />
      </div>

      {/* Bottom action bar */}
      <AnimatePresence mode="wait">
        {!isGameOver && !isGuessing && (
          <motion.div
            key="answer-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: cinematicEase }}
            className="sticky bottom-0 z-20 bg-primary/90 backdrop-blur-xl border-t border-white/[0.06]"
          >
            <div className="px-4 md:px-6 py-4 max-w-3xl mx-auto w-full">
              <AnswerButtons
                onAnswer={handleAnswer}
                disabled={loading}
              />
            </div>
          </motion.div>
        )}

        {isGameOver && (
          <motion.div
            key="game-over"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: cinematicEase }}
            className="sticky bottom-0 z-20 bg-primary/90 backdrop-blur-xl border-t border-white/[0.06]"
          >
            <div className="px-4 md:px-6 py-4 max-w-3xl mx-auto w-full flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm font-semibold text-white/60">
                  {state === 'won' ? '🏆 The machine wins!' : '💪 You outsmarted the AI!'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePlayAgain}
                className="px-6 py-3 rounded-xl bg-accent-green/10 border border-accent-green/30 text-accent-green text-sm font-bold uppercase tracking-widest cursor-pointer hover:bg-accent-green/20 transition-all duration-300"
              >
                Play Again →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final guess overlay */}
      <AnimatePresence>
        {isGuessing && guess && (
          <FinalGuess
            guess={guess}
            confidence={confidence}
            category={category}
            onConfirm={handleConfirmGuess}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
