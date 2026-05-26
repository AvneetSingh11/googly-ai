import type { Turn, Answer } from '@/types/game';

// ─── Intent Categories ──────────────────────────────────────────────────────

export type IntentCategory =
  | 'nationality'
  | 'role'
  | 'batting_style'
  | 'bowling_style'
  | 'team_history'
  | 'captaincy'
  | 'trophies'
  | 'era'
  | 'records'
  | 'iconic_trait'
  | 'geography'
  | 'match_type'
  | 'match_era'
  | 'team_identity'
  | 'general'
  | 'unknown';

// ─── Deduction State ────────────────────────────────────────────────────────

export interface DeductionState {
  confirmedAttributes: Map<string, string>;
  deniedAttributes: Map<string, string>;
  intentsExplored: Set<string>;
  confidenceHistory: number[];
  contradictions: Contradiction[];
  candidateEstimate: number;
}

export interface Contradiction {
  turnA: number;
  turnB: number;
  intentA: string;
  intentB: string;
  description: string;
}

// ─── Create Initial State ───────────────────────────────────────────────────

export function createDeductionState(): DeductionState {
  return {
    confirmedAttributes: new Map(),
    deniedAttributes: new Map(),
    intentsExplored: new Set(),
    confidenceHistory: [],
    contradictions: [],
    candidateEstimate: 100,
  };
}

// ─── Track Intent ───────────────────────────────────────────────────────────

export function trackIntent(
  state: DeductionState,
  turn: Turn
): DeductionState {
  const updated = { ...state };
  const intent = normalizeIntent(turn.intent);

  updated.intentsExplored = new Set(state.intentsExplored);
  updated.intentsExplored.add(intent);

  updated.confidenceHistory = [...state.confidenceHistory, turn.confidence];

  // Track confirmed/denied attributes
  if (turn.answer === 'yes') {
    updated.confirmedAttributes = new Map(state.confirmedAttributes);
    updated.confirmedAttributes.set(intent, turn.question);
  } else if (turn.answer === 'no') {
    updated.deniedAttributes = new Map(state.deniedAttributes);
    updated.deniedAttributes.set(intent, turn.question);
  }

  // Update candidate estimate
  updated.candidateEstimate = estimateCandidates(
    turn.turnNumber,
    turn.confidence,
    turn.answer
  );

  return updated;
}

// ─── Detect Contradictions ──────────────────────────────────────────────────

export function detectContradictions(turns: Turn[]): Contradiction[] {
  const contradictions: Contradiction[] = [];

  // Build an index of answers by broad intent category
  const intentAnswers: Map<string, { turnNumber: number; answer: Answer; question: string }[]> =
    new Map();

  for (const turn of turns) {
    const normalizedIntent = normalizeIntent(turn.intent);
    const existing = intentAnswers.get(normalizedIntent) ?? [];
    existing.push({
      turnNumber: turn.turnNumber,
      answer: turn.answer,
      question: turn.question,
    });
    intentAnswers.set(normalizedIntent, existing);
  }

  // Check for contradictions within each intent category
  for (const [intent, answers] of intentAnswers.entries()) {
    // Contradiction: same narrow intent asked differently with conflicting answers
    // This is a heuristic — check for yes and no on very similar questions
    const yesAnswers = answers.filter((a) => a.answer === 'yes');
    const noAnswers = answers.filter((a) => a.answer === 'no');

    // Look for mutually exclusive contradictions
    for (const y of yesAnswers) {
      for (const n of noAnswers) {
        if (areContradictory(y.question, n.question, intent)) {
          contradictions.push({
            turnA: y.turnNumber,
            turnB: n.turnNumber,
            intentA: intent,
            intentB: intent,
            description: `Conflicting answers for "${intent}": "${y.question}" → YES vs "${n.question}" → NO`,
          });
        }
      }
    }
  }

  return contradictions;
}

// ─── Confidence Scoring ─────────────────────────────────────────────────────

export function calculateConfidence(
  turns: Turn[],
  candidateEstimate: number
): number {
  if (turns.length === 0) return 0;

  // Base confidence from number of questions asked
  const turnFactor = Math.min(turns.length / 15, 1) * 30;

  // Confidence from candidate elimination
  const candidateFactor = Math.max(0, (1 - candidateEstimate / 100)) * 50;

  // Confidence from consistent "yes" answers on specific intents
  const yesAnswers = turns.filter((t) => t.answer === 'yes').length;
  const specificityFactor = Math.min(yesAnswers * 5, 20);

  // Latest model-reported confidence (weighted heavily)
  const lastReportedConfidence = turns[turns.length - 1]?.confidence ?? 0;
  const modelFactor = lastReportedConfidence * 0.5;

  // Penalty for contradictions
  const contradictions = detectContradictions(turns);
  const contradictionPenalty = contradictions.length * 10;

  const rawScore =
    turnFactor + candidateFactor + specificityFactor + modelFactor - contradictionPenalty;

  return Math.min(100, Math.max(0, Math.round(rawScore)));
}

// ─── Candidate Estimation ───────────────────────────────────────────────────

export function estimateCandidates(
  turnNumber: number,
  confidence: number,
  lastAnswer: Answer
): number {
  // Start with ~50 candidates for players, ~10 for teams, ~20 for matches
  // Each "yes" answer cuts more precisely, "no" eliminates broader categories
  // "dont_know" provides minimal information

  const basePool = 50;
  let reductionFactor: number;

  switch (lastAnswer) {
    case 'yes':
      reductionFactor = 0.55; // Each "yes" roughly halves the pool
      break;
    case 'no':
      reductionFactor = 0.60; // "no" is slightly less informative
      break;
    case 'dont_know':
      reductionFactor = 0.85; // "don't know" barely narrows
      break;
  }

  const estimated = Math.round(
    basePool * Math.pow(reductionFactor, turnNumber)
  );

  // Cross-reference with confidence — higher confidence means fewer candidates
  const confidenceAdjusted = Math.round(
    estimated * (1 - confidence / 200)
  );

  return Math.max(1, confidenceAdjusted);
}

// ─── Summary for Prompt Injection ───────────────────────────────────────────

export function buildDeductionSummary(state: DeductionState): string {
  const confirmed = Array.from(state.confirmedAttributes.entries())
    .map(([k, v]) => `  ✓ ${k}: ${v}`)
    .join('\n');

  const denied = Array.from(state.deniedAttributes.entries())
    .map(([k, v]) => `  ✗ ${k}: ${v}`)
    .join('\n');

  const contradictionSummary = state.contradictions.length > 0
    ? `\n⚠️ Contradictions detected:\n${state.contradictions.map((c) => `  - ${c.description}`).join('\n')}`
    : '';

  return `
─── DEDUCTION STATE ───
Intents explored: ${Array.from(state.intentsExplored).join(', ')}
Candidate estimate: ~${state.candidateEstimate} remaining

Confirmed:
${confirmed || '  (none yet)'}

Denied:
${denied || '  (none yet)'}
${contradictionSummary}
`;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeIntent(intent: string): string {
  return intent
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function areContradictory(
  questionA: string,
  questionB: string,
  _intent: string
): boolean {
  const a = questionA.toLowerCase();
  const b = questionB.toLowerCase();

  // Simple heuristic: check if questions are about the same specific attribute
  // For instance "Is this player Indian?" (YES) vs "Is this player overseas?" (NO) — NOT contradictory
  // vs "Is this player Indian?" (YES) and "Is this player Indian?" (NO) — contradictory

  // Check for very similar questions
  const wordsA = new Set(a.split(/\s+/).filter((w) => w.length > 3));
  const wordsB = new Set(b.split(/\s+/).filter((w) => w.length > 3));

  let overlap = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) overlap++;
  }

  const maxSize = Math.max(wordsA.size, wordsB.size);
  if (maxSize === 0) return false;

  const similarity = overlap / maxSize;

  // If questions are very similar (>70% word overlap), they might be contradictory
  return similarity > 0.7;
}
