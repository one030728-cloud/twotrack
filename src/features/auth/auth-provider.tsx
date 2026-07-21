"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  MOCK_USERS,
  canAccessPath,
  type AuthUser,
  type UserRole,
} from "@/features/auth/permissions";

const STORAGE_KEY = "posmos-auth-user";

interface AuthContextValue {
  ready: boolean;
  user: AuthUser | null;
  login: (role: UserRole) => void;
  logout: () => void;
  canAccess: (pathname: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed = MOCK_USERS.find((user) => user.id === raw);
  return parsed ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setUser(readStoredUser());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      user,
      login(role) {
        const nextUser = MOCK_USERS.find(
          (candidate) => candidate.role === role,
        );
        if (!nextUser) return;
        window.localStorage.setItem(STORAGE_KEY, nextUser.id);
        setUser(nextUser);
      },
      logout() {
        window.localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      },
      canAccess(pathname) {
        return user ? canAccessPath(user.role, pathname) : false;
      },
    }),
    [ready, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
