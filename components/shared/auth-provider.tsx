'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AuthContextValue, AuthUser, AuthSession } from '@/types/auth';

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

/**
 * AuthProvider
 *
 * Wraps the app and provides the current Supabase auth state to all
 * Client Components via the `useAuth()` hook.
 *
 * Design decisions:
 *   - We do NOT duplicate auth state in Zustand. The cookie-based session
 *     from @supabase/ssr is the single source of truth; this context simply
 *     exposes it to the React tree.
 *   - `initialSession` is read by the Server Component parent
 *     (app/layout.tsx) and passed as a prop, so the first render is
 *     correctly hydrated without a loading flash.
 *   - `onAuthStateChange` keeps the context up-to-date after login/logout
 *     without needing a page reload.
 */
interface AuthProviderProps {
  children: ReactNode;
  initialUser: AuthUser | null;
  initialSession: AuthSession | null;
}

export function AuthProvider({
  children,
  initialUser,
  initialSession,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [session, setSession] = useState<AuthSession | null>(initialSession);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    setIsLoading(true);
    await supabase.auth.signOut();
    // onAuthStateChange will clear user/session above.
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — consume the auth context in any Client Component.
 *
 * @example
 * const { user, signOut } = useAuth();
 * if (user) { ... }
 */
export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
