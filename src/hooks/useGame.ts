'use client';

import { useState, useCallback, useRef } from 'react';
import type { GameCategory, GameState, PersonaMode, Answer } from '@/types/game';

export interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  personaMode?: PersonaMode;
  confidence?: number;
  isGuess?: boolean;
  guess?: string;
}

interface GameData {
  gameId: string;
  category: GameCategory;
  state: GameState;
  messages: ChatMessage[];
  questionNumber: number;
  confidence: number;
  currentPersona: PersonaMode;
  guess: string | null;
  startTime: number;
  elapsedTime: number;
  loading: boolean;
  error: string | null;
}

const initialGameData: GameData = {
  gameId: '',
  category: 'player',
  state: 'idle',
  messages: [],
  questionNumber: 0,
  confidence: 0,
  currentPersona: 'analyst',
  guess: null,
  startTime: 0,
  elapsedTime: 0,
  loading: false,
  error: null,
};

export function useGame() {
  const [game, setGame] = useState<GameData>(initialGameData);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const conversationRef = useRef<{ role: string; content: string }[]>([]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      setGame((prev) => ({
        ...prev,
        elapsedTime: Math.floor((Date.now() - start) / 1000),
      }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const generateMessageId = () =>
    `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const callGameApi = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${res.status}`);
      }

      return res.json();
    },
    []
  );

  const startGame = useCallback(
    async (category: GameCategory, gameId: string) => {
      conversationRef.current = [];

      setGame({
        ...initialGameData,
        gameId,
        category,
        state: 'playing',
        loading: true,
        startTime: Date.now(),
      });

      startTimer();

      try {
        const response = await callGameApi({
          action: 'start',
          gameId,
          category,
        });

        const aiMessage: ChatMessage = {
          id: generateMessageId(),
          type: 'ai',
          content: response.question || response.message || "Let's begin! Think of an IPL entity and I'll try to guess it. Here's my first question...",
          personaMode: response.personaMode || 'analyst',
          confidence: response.confidence || 5,
        };

        conversationRef.current.push(
          { role: 'assistant', content: aiMessage.content }
        );

        setGame((prev) => ({
          ...prev,
          messages: [aiMessage],
          questionNumber: 1,
          confidence: response.confidence || 5,
          currentPersona: response.personaMode || 'analyst',
          loading: false,
        }));
      } catch (err) {
        // Fallback: start with a default question if API fails
        const fallbackMessage: ChatMessage = {
          id: generateMessageId(),
          type: 'ai',
          content: category === 'player'
            ? "Alright, you've picked an IPL player! Let me start figuring out who. Is this player currently active in IPL?"
            : category === 'team'
            ? "An IPL team, interesting choice! Has this team won the IPL at least once?"
            : "A specific IPL match! That's bold. Did this match take place in the last 5 years?",
          personaMode: 'analyst',
          confidence: 5,
        };

        conversationRef.current.push(
          { role: 'assistant', content: fallbackMessage.content }
        );

        setGame((prev) => ({
          ...prev,
          messages: [fallbackMessage],
          questionNumber: 1,
          confidence: 5,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to start game',
        }));
      }
    },
    [callGameApi, startTimer]
  );

  const submitAnswer = useCallback(
    async (answer: Answer) => {
      const answerText =
        answer === 'yes' ? 'Yes' : answer === 'no' ? 'No' : "Don't know";

      const userMessage: ChatMessage = {
        id: generateMessageId(),
        type: 'user',
        content: answerText,
      };

      conversationRef.current.push({ role: 'user', content: answerText });

      setGame((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        loading: true,
        error: null,
      }));

      try {
        const response = await callGameApi({
          action: 'answer',
          gameId: game.gameId,
          category: game.category,
          answer,
          questionNumber: game.questionNumber,
          conversationHistory: conversationRef.current,
        });

        const isGuess = response.isGuess || response.state === 'guessing';

        const aiMessage: ChatMessage = {
          id: generateMessageId(),
          type: 'ai',
          content: response.question || response.message || response.guess || '',
          personaMode: response.personaMode || game.currentPersona,
          confidence: response.confidence || game.confidence,
          isGuess,
          guess: isGuess ? (response.guess || response.message) : undefined,
        };

        conversationRef.current.push(
          { role: 'assistant', content: aiMessage.content }
        );

        setGame((prev) => ({
          ...prev,
          messages: [...prev.messages, aiMessage],
          questionNumber: isGuess ? prev.questionNumber : prev.questionNumber + 1,
          confidence: response.confidence ?? prev.confidence,
          currentPersona: response.personaMode || prev.currentPersona,
          state: isGuess ? 'guessing' : 'playing',
          guess: isGuess ? (response.guess || response.message || null) : null,
          loading: false,
        }));
      } catch (err) {
        setGame((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to get response',
        }));
      }
    },
    [callGameApi, game.gameId, game.category, game.questionNumber, game.currentPersona, game.confidence]
  );

  const confirmGuess = useCallback(
    async (correct: boolean) => {
      stopTimer();

      const resultMessage: ChatMessage = {
        id: generateMessageId(),
        type: 'ai',
        content: correct
          ? "🎉 I KNEW IT! The machine never fails. What a match that was!"
          : "😤 You beat me this time. But I'll be back stronger. GG!",
        personaMode: correct ? 'cocky' : 'dramatic',
      };

      setGame((prev) => ({
        ...prev,
        messages: [...prev.messages, resultMessage],
        state: correct ? 'won' : 'lost',
      }));

      // Update local analytics
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isWin: correct,
            category: game.category,
            turnsTaken: game.questionNumber,
            timeElapsed: game.elapsedTime,
            finalGuess: game.guess
          }),
        });
      } catch (err) {
        console.warn('Failed to save analytics', err);
      }
    },
    [stopTimer]
  );

  const resetGame = useCallback(() => {
    stopTimer();
    conversationRef.current = [];
    setGame(initialGameData);
  }, [stopTimer]);

  return {
    ...game,
    startGame,
    submitAnswer,
    confirmGuess,
    resetGame,
  };
}
