"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { canAccessPath, type AuthUser } from "@/features/auth/permissions";
import { fetchEmployees } from "@/features/employees/api/employees-api";

export const AUTH_STORAGE_KEY = "posmos-auth-user";
const STORAGE_KEY = AUTH_STORAGE_KEY;

interface AuthContextValue {
  ready: boolean;
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  canAccess: (pathname: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    const raw =
      typeof window === "undefined"
        ? null
        : window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      Promise.resolve().then(() => {
        if (!cancelled) setReady(true);
      });
      return () => {
        cancelled = true;
      };
    }

    fetchEmployees().then((employees) => {
      if (cancelled) return;
      setUser(employees.find((employee) => employee.id === raw) ?? null);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      user,
      login(nextUser) {
        window.localStorage.setItem(STORAGE_KEY, nextUser.id);
        setUser(nextUser);
      },
      logout() {
        window.localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      },
      canAccess(pathname) {
        return user
          ? canAccessPath(user.role, pathname, user.positions)
          : false;
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
