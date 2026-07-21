"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2Icon } from "lucide-react";

interface SnackbarState {
  id: number;
  message: string;
}

interface SnackbarContextValue {
  showSnackbar: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSnackbar = useCallback((message: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSnackbar({ id: Date.now(), message });
    timeoutRef.current = setTimeout(() => setSnackbar(null), 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const value = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed right-5 bottom-5 z-[100] flex flex-col items-end"
      >
        {snackbar && (
          <div
            key={snackbar.id}
            role="status"
            className="bg-foreground text-background shadow-card flex min-h-11 w-[min(375px,calc(100vw-32px))] max-w-[480px] items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
          >
            <CheckCircle2Icon className="size-4 shrink-0" />
            {snackbar.message}
          </div>
        )}
      </div>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within SnackbarProvider");
  }
  return context;
}
