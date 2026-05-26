import {
  signInAnonymously as firebaseSignInAnonymously,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
  Unsubscribe,
} from 'firebase/auth';
import { auth } from '@/firebase/config';

// ─── Anonymous Sign-In ──────────────────────────────────────────────────────

export async function signInAnonymously(): Promise<User> {
  try {
    const result = await firebaseSignInAnonymously(auth);
    return result.user;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Anonymous sign-in failed';
    console.error('[Auth] Anonymous sign-in error:', message);
    throw new Error(message);
  }
}

// ─── Auth State Listener ────────────────────────────────────────────────────

export function onAuthStateChanged(
  callback: (user: User | null) => void
): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, callback, (error) => {
    console.error('[Auth] Auth state change error:', error.message);
    callback(null);
  });
}

// ─── Get Current User ───────────────────────────────────────────────────────

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// ─── Ensure Authenticated ───────────────────────────────────────────────────

export async function ensureAuthenticated(): Promise<User> {
  const current = auth.currentUser;
  if (current) return current;
  return signInAnonymously();
}
