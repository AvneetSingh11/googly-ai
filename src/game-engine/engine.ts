import { v4 as uuidv4 } from 'uuid';
import type {
  Game,
  GameCategory,
  GameState,
  Turn,
  Answer,
  GeminiResponse,
} from '@/types/game';
import {
  createDeductionState,
  trackIntent,
  calculateConfidence,
  type DeductionState,
} from '@/game-engine/deduction';

// ─── Constants ──────────────────────────────────────────────────────────────

export const MAX_TURNS = 15;
export const AUTO_GUESS_CONFIDENCE_THRESHOLD = 90;

// ─── Create New Game ────────────────────────────────────────────────────────

export function createGame(
  userId: string,
  category: GameCategory
): Game {
  return {
    id: uuidv4(),
    userId,
    category,
    state: 'in_progress' as GameState,
    turns: [],
    currentTurn: 1,
    maxTurns: MAX_TURNS,
    finalGuess: null,
    finalGuessCorrect: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    completedAt: null,
  };
}

// ─── State Machine Transitions ──────────────────────────────────────────────

const VALID_TRANSITIONS: Record<GameState, GameState[]> = {
  idle: ['category_select'],
  category_select: ['in_progress', 'abandoned'],
  thinking: ['in_progress', 'guessing', 'abandoned'],
  in_progress: ['thinking', 'guessing', 'abandoned'],
  guessing: ['won', 'lost'],
  won: ['idle'],
  lost: ['idle'],
  abandoned: ['idle'],
};

export function canTransition(from: GameState, to: GameState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function transitionState(game: Game, newState: GameState): Game {
  if (!canTransition(game.state, newState)) {
    throw new Error(
      `Invalid state transition: ${game.state} → ${newState}`
    );
  }

  return {
    ...game,
    state: newState,
    updatedAt: Date.now(),
    completedAt:
      newState === 'won' || newState === 'lost' || newState === 'abandoned'
        ? Date.now()
        : game.completedAt,
  };
}

// ─── Process AI Response into Turn ──────────────────────────────────────────

export function processAIResponse(
  game: Game,
  response: GeminiResponse,
  answer: Answer
): Turn {
  return {
    turnNumber: game.currentTurn,
    question: response.question,
    answer,
    intent: response.intent,
    confidence: response.confidence,
    personaMode: response.personaMode,
    reasoning: response.reasoning,
    timestamp: Date.now(),
  };
}

// ─── Add Turn to Game ───────────────────────────────────────────────────────

export function addTurnToGame(game: Game, turn: Turn): Game {
  const updatedTurns = [...game.turns, turn];

  return {
    ...game,
    turns: updatedTurns,
    currentTurn: game.currentTurn + 1,
    updatedAt: Date.now(),
  };
}

// ─── Should Auto-Guess ──────────────────────────────────────────────────────

export function shouldAutoGuess(game: Game, confidence: number): boolean {
  // Must guess on turn 15 (the last turn)
  if (game.currentTurn >= MAX_TURNS) return true;

  // Auto-guess if confidence exceeds threshold
  if (confidence >= AUTO_GUESS_CONFIDENCE_THRESHOLD) return true;

  return false;
}

// ─── Process Guess Result ───────────────────────────────────────────────────

export function processGuessResult(
  game: Game,
  guess: string,
  isCorrect: boolean
): Game {
  const newState: GameState = isCorrect ? 'won' : 'lost';

  return {
    ...game,
    state: newState,
    finalGuess: guess,
    finalGuessCorrect: isCorrect,
    updatedAt: Date.now(),
    completedAt: Date.now(),
  };
}

// ─── Core Game Loop Step ────────────────────────────────────────────────────

export interface GameLoopResult {
  game: Game;
  deductionState: DeductionState;
  shouldGuess: boolean;
  isGameOver: boolean;
  turnsRemaining: number;
}

export function processGameStep(
  game: Game,
  response: GeminiResponse,
  answer: Answer
): GameLoopResult {
  // Create the turn
  const turn = processAIResponse(game, response, answer);

  // Add turn to game
  let updatedGame = addTurnToGame(game, turn);

  // Build deduction state from all turns
  let deductionState = createDeductionState();
  for (const t of updatedGame.turns) {
    deductionState = trackIntent(deductionState, t);
  }

  // Calculate actual confidence
  const actualConfidence = calculateConfidence(
    updatedGame.turns,
    deductionState.candidateEstimate
  );

  // Check if we should auto-guess
  const shouldGuessNow = shouldAutoGuess(updatedGame, actualConfidence);

  // Check if game is over
  const isGameOver =
    updatedGame.state === 'won' ||
    updatedGame.state === 'lost' ||
    updatedGame.state === 'abandoned';

  // If the AI made a guess in its response
  if (response.isGuess && response.guess) {
    updatedGame = {
      ...updatedGame,
      state: 'guessing',
      finalGuess: response.guess,
      updatedAt: Date.now(),
    };
  }

  return {
    game: updatedGame,
    deductionState,
    shouldGuess: shouldGuessNow,
    isGameOver,
    turnsRemaining: MAX_TURNS - updatedGame.currentTurn + 1,
  };
}

// ─── Abandon Game ───────────────────────────────────────────────────────────

export function abandonGame(game: Game): Game {
  if (game.state === 'won' || game.state === 'lost') {
    throw new Error('Cannot abandon a completed game');
  }

  return {
    ...game,
    state: 'abandoned',
    updatedAt: Date.now(),
    completedAt: Date.now(),
  };
}

// ─── Game Summary ───────────────────────────────────────────────────────────

export interface GameSummary {
  totalTurns: number;
  finalGuess: string | null;
  wasCorrect: boolean | null;
  category: GameCategory;
  avgConfidence: number;
  personasUsed: string[];
  intentsExplored: string[];
}

export function getGameSummary(game: Game): GameSummary {
  const avgConfidence =
    game.turns.length > 0
      ? Math.round(
          game.turns.reduce((sum, t) => sum + t.confidence, 0) /
            game.turns.length
        )
      : 0;

  const personasUsed = [...new Set(game.turns.map((t) => t.personaMode))];
  const intentsExplored = [...new Set(game.turns.map((t) => t.intent))];

  return {
    totalTurns: game.turns.length,
    finalGuess: game.finalGuess,
    wasCorrect: game.finalGuessCorrect,
    category: game.category,
    avgConfidence,
    personasUsed,
    intentsExplored,
  };
}
