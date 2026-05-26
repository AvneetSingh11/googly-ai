'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionBubble from './QuestionBubble';
import TypingIndicator from './TypingIndicator';
import { cn } from '@/utils/helpers';
import type { ChatMessage } from '@/hooks/useGame';

interface ChatHistoryProps {
  messages: ChatMessage[];
  loading?: boolean;
}

export default function ChatHistory({
  messages,
  loading = false,
}: ChatHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-4 px-2 md:px-4"
    >
      <div className="flex flex-col gap-3 min-h-full justify-end">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              layout
              className={cn(
                'flex',
                msg.type === 'ai' ? 'justify-start' : 'justify-end'
              )}
            >
              {msg.type === 'ai' ? (
                <QuestionBubble
                  message={msg.content}
                  personaMode={msg.personaMode}
                  index={index}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="max-w-[70%]"
                >
                  <div
                    className={cn(
                      'px-5 py-3 rounded-2xl rounded-tr-md font-semibold text-sm uppercase tracking-wider',
                      msg.content === 'Yes'
                        ? 'bg-accent-green/15 text-accent-green border border-accent-green/20'
                        : msg.content === 'No'
                        ? 'bg-danger/15 text-danger border border-danger/20'
                        : 'bg-warning/15 text-warning border border-warning/20'
                    )}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {loading && (
            <div className="flex justify-start">
              <TypingIndicator />
            </div>
          )}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
}
