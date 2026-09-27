import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';
import { clearSession, loadSession, saveSession } from '@/services/session';
import { storage } from '@/services/storage';
import { Session, User } from '@/types';

type AuthContextValue = {
  user: User | null;
  isRestoring: boolean;
  hasSeenOnboarding: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isRestoring, setRestoring] = useState(true);
  const [hasSeenOnboarding, setSeen] = useState(false);

  useEffect(() => {
    (async () => {
      const [s, seen] = await Promise.all([loadSession(), storage.get('onboarding', false)]);
      setSession(s);
      setSeen(seen);
      setRestoring(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const s = await api.login(email, password);
    await saveSession(s);
    setSession(s);
    return s.user;
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  const completeOnboarding = useCallback(async () => {
    setSeen(true);
    await storage.set('onboarding', true);
  }, []);

  const value = useMemo(
    () => ({ user: session?.user ?? null, isRestoring, hasSeenOnboarding, login, logout, completeOnboarding }),
    [session, isRestoring, hasSeenOnboarding, login, logout, completeOnboarding],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
