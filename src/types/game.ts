// ─── Game Types ─────────────────────────────────────────────────────────────

export type GameCategory = 'player' | 'team' | 'match';

export type GameState =
  | 'idle'
  | 'category_select'
  | 'thinking'
  | 'in_progress'
  | 'guessing'
  | 'won'
  | 'lost'
  | 'abandoned';

export type PersonaMode =
  | 'analyst'
  | 'entertainer'
  | 'cocky'
  | 'panicked'
  | 'dramatic';

export type Answer = 'yes' | 'no' | 'dont_know';

// ─── Turn ───────────────────────────────────────────────────────────────────

export interface Turn {
  turnNumber: number;
  question: string;
  answer: Answer;
  intent: string;
  confidence: number;
  personaMode: PersonaMode;
  reasoning: string;
  timestamp: number;
}

// ─── Game ───────────────────────────────────────────────────────────────────

export interface Game {
  id: string;
  userId: string;
  category: GameCategory;
  state: GameState;
  turns: Turn[];
  currentTurn: number;
  maxTurns: number;
  finalGuess: string | null;
  finalGuessCorrect: boolean | null;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

// ─── Gemini Response ────────────────────────────────────────────────────────

export interface GeminiResponse {
  question: string;
  intent: string;
  confidence: number;
  personaMode: PersonaMode;
  reasoning: string;
  isGuess: boolean;
  guess: string | null;
  eliminatedCount?: number;
  remainingCount?: number;
}

// ─── Chat Message ───────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  personaMode?: PersonaMode;
  confidence?: number;
  isGuess?: boolean;
  guess?: string;
  category?: GameCategory;
}

// ─── Game Session (client-side convenience) ─────────────────────────────────

export interface GameSession {
  game: Game;
  messages: ChatMessage[];
}

// ─── API Request / Response ─────────────────────────────────────────────────

export interface GameAPIRequest {
  category: GameCategory;
  turns: Turn[];
  currentAnswer?: Answer;
}

export interface GameAPIResponse {
  success: boolean;
  data?: GeminiResponse;
  error?: string;
}
