import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  Timestamp,
  DocumentReference,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Game, Turn } from '@/types/game';
import type { LeaderboardEntry, PlayerStats, LeaderboardFilters } from '@/types/leaderboard';

// ─── Collection References ──────────────────────────────────────────────────

const GAMES_COLLECTION = 'games';
const TURNS_SUBCOLLECTION = 'turns';
const LEADERBOARD_COLLECTION = 'leaderboard';
const PLAYERS_COLLECTION = 'players';

const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// ─── Games CRUD ─────────────────────────────────────────────────────────────

export async function createGame(game: Game): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const gameRef = doc(db, GAMES_COLLECTION, game.id);
    await setDoc(gameRef, {
      ...game,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create game';
    console.error('[Firestore] createGame error:', msg);
    throw new Error(msg);
  }
}

export async function getGame(gameId: string): Promise<Game | null> {
  if (!isFirebaseConfigured) return null;
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    const snapshot = await getDoc(gameRef);
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    return {
      ...data,
      id: snapshot.id,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : data.updatedAt,
      completedAt: data.completedAt instanceof Timestamp ? data.completedAt.toMillis() : data.completedAt,
    } as Game;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get game';
    console.error('[Firestore] getGame error:', msg);
    throw new Error(msg);
  }
}

export async function updateGame(
  gameId: string,
  updates: Partial<Game>
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    await updateDoc(gameRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update game';
    console.error('[Firestore] updateGame error:', msg);
    throw new Error(msg);
  }
}

export async function deleteGame(gameId: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const gameRef = doc(db, GAMES_COLLECTION, gameId);
    await deleteDoc(gameRef);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete game';
    console.error('[Firestore] deleteGame error:', msg);
    throw new Error(msg);
  }
}

export async function getUserGames(
  userId: string,
  maxResults: number = 20
): Promise<Game[]> {
  if (!isFirebaseConfigured) return [];
  try {
    const gamesRef = collection(db, GAMES_COLLECTION);
    const q = query(
      gamesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : data.updatedAt,
        completedAt: data.completedAt instanceof Timestamp ? data.completedAt.toMillis() : data.completedAt,
      } as Game;
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get user games';
    console.error('[Firestore] getUserGames error:', msg);
    throw new Error(msg);
  }
}

// ─── Turns CRUD (Subcollection) ─────────────────────────────────────────────

export async function addTurn(gameId: string, turn: Turn): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const turnRef = doc(
      db,
      GAMES_COLLECTION,
      gameId,
      TURNS_SUBCOLLECTION,
      `turn_${turn.turnNumber}`
    );
    await setDoc(turnRef, {
      ...turn,
      timestamp: serverTimestamp(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to add turn';
    console.error('[Firestore] addTurn error:', msg);
    throw new Error(msg);
  }
}

export async function batchAddTurns(
  gameId: string,
  turns: Turn[]
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const batch = writeBatch(db);
    for (const turn of turns) {
      const turnRef = doc(
        db,
        GAMES_COLLECTION,
        gameId,
        TURNS_SUBCOLLECTION,
        `turn_${turn.turnNumber}`
      );
      batch.set(turnRef, {
        ...turn,
        timestamp: serverTimestamp(),
      });
    }
    await batch.commit();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to batch add turns';
    console.error('[Firestore] batchAddTurns error:', msg);
    throw new Error(msg);
  }
}

export async function getGameTurns(gameId: string): Promise<Turn[]> {
  if (!isFirebaseConfigured) return [];
  try {
    const turnsRef = collection(
      db,
      GAMES_COLLECTION,
      gameId,
      TURNS_SUBCOLLECTION
    );
    const q = query(turnsRef, orderBy('turnNumber', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        ...data,
        timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : data.timestamp,
      } as Turn;
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get game turns';
    console.error('[Firestore] getGameTurns error:', msg);
    throw new Error(msg);
  }
}

// ─── Leaderboard ────────────────────────────────────────────────────────────

export async function addLeaderboardEntry(
  entry: LeaderboardEntry
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const entryRef = doc(db, LEADERBOARD_COLLECTION, entry.id);
    await setDoc(entryRef, {
      ...entry,
      completedAt: serverTimestamp(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to add leaderboard entry';
    console.error('[Firestore] addLeaderboardEntry error:', msg);
    throw new Error(msg);
  }
}

export async function getLeaderboard(
  filters: LeaderboardFilters = {}
): Promise<LeaderboardEntry[]> {
  if (!isFirebaseConfigured) return [];
  try {
    const leaderboardRef = collection(db, LEADERBOARD_COLLECTION);
    const constraints: QueryConstraint[] = [];

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      constraints.push(where('category', '==', filters.category));
    }

    // Filter by time range
    if (filters.timeRange && filters.timeRange !== 'all_time') {
      const now = Date.now();
      let cutoff: number;
      switch (filters.timeRange) {
        case 'today':
          cutoff = now - 24 * 60 * 60 * 1000;
          break;
        case 'week':
          cutoff = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case 'month':
          cutoff = now - 30 * 24 * 60 * 60 * 1000;
          break;
        default:
          cutoff = 0;
      }
      constraints.push(where('completedAt', '>=', Timestamp.fromMillis(cutoff)));
    }

    // Only correctly-guessed games
    constraints.push(where('wasGuessedCorrectly', '==', true));

    // Order by fewest turns used (best performance)
    constraints.push(orderBy('turnsUsed', 'asc'));

    // Limit results
    constraints.push(limit(filters.limit ?? 50));

    const q = query(leaderboardRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        completedAt: data.completedAt instanceof Timestamp ? data.completedAt.toMillis() : data.completedAt,
      } as LeaderboardEntry;
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get leaderboard';
    console.error('[Firestore] getLeaderboard error:', msg);
    throw new Error(msg);
  }
}

// ─── Player Stats ───────────────────────────────────────────────────────────

export async function getPlayerStats(
  userId: string
): Promise<PlayerStats | null> {
  if (!isFirebaseConfigured) return null;
  try {
    const playerRef = doc(db, PLAYERS_COLLECTION, userId);
    const snapshot = await getDoc(playerRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as PlayerStats;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get player stats';
    console.error('[Firestore] getPlayerStats error:', msg);
    throw new Error(msg);
  }
}

export async function updatePlayerStats(
  userId: string,
  stats: Partial<PlayerStats>
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const playerRef = doc(db, PLAYERS_COLLECTION, userId);
    const snapshot = await getDoc(playerRef);
    if (snapshot.exists()) {
      await updateDoc(playerRef, stats);
    } else {
      await setDoc(playerRef, stats);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update player stats';
    console.error('[Firestore] updatePlayerStats error:', msg);
    throw new Error(msg);
  }
}

// ─── Composite: Record Game Result ──────────────────────────────────────────

export async function recordGameResult(
  game: Game,
  displayName: string
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const batch = writeBatch(db);

    // Update game document
    const gameRef: DocumentReference = doc(db, GAMES_COLLECTION, game.id);
    batch.update(gameRef, {
      state: game.state,
      finalGuess: game.finalGuess,
      finalGuessCorrect: game.finalGuessCorrect,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Add leaderboard entry
    const leaderboardEntryId = `${game.id}_result`;
    const leaderboardRef: DocumentReference = doc(
      db,
      LEADERBOARD_COLLECTION,
      leaderboardEntryId
    );
    batch.set(leaderboardRef, {
      id: leaderboardEntryId,
      userId: game.userId,
      displayName,
      category: game.category,
      turnsUsed: game.currentTurn,
      wasGuessedCorrectly: game.finalGuessCorrect ?? false,
      entityName: game.finalGuess ?? '',
      completedAt: serverTimestamp(),
      streak: 0,
    });

    await batch.commit();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to record game result';
    console.error('[Firestore] recordGameResult error:', msg);
    throw new Error(msg);
  }
}
