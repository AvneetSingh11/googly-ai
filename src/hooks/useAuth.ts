'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

interface AuthUser {
  uid: string;
  isAnonymous: boolean;
  displayName: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initAuth = useCallback(async () => {
    try {
      // TODO: Replace with Firebase anonymous auth
      // import { signInAnon, onAuthChange } from '@/firebase/auth';
      // const unsubscribe = onAuthChange((firebaseUser) => {
      //   if (firebaseUser) {
      //     setUser({ uid: firebaseUser.uid, isAnonymous: true, displayName: null });
      //   }
      //   setLoading(false);
      // });
      // await signInAnon();
      // return unsubscribe;

      // Local fallback: generate a persistent anonymous user ID
      let storedUid = localStorage.getItem('googly-ai-uid');
      if (!storedUid) {
        storedUid = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        localStorage.setItem('googly-ai-uid', storedUid);
      }

      setUser({
        uid: storedUid,
        isAnonymous: true,
        displayName: null,
      });
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
