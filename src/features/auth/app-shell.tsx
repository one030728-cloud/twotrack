"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AuthProvider, useAuth } from "@/features/auth/auth-provider";

function AccessDenied() {
  return (
    <main className="flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center">
      <h1 className="text-foreground text-2xl font-bold">접근 권한 없음</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        현재 계정으로는 이 페이지를 사용할 수 없습니다.
      </p>
    </main>
  );
}

function ProtectedAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, user, canAccess } = useAuth();
  const loginPath = pathname === "/login";

  useEffect(() => {
    if (!ready || loginPath || user) return;
    router.replace("/login");
  }, [loginPath, ready, router, user]);

  if (loginPath) return <>{children}</>;

  if (!ready || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">세션 확인 중...</p>
      </div>
    );
  }

  return (
    <>
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AppHeader />
        {canAccess(pathname) ? (
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {children}
          </main>
        ) : (
          <AccessDenied />
        )}
      </div>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedAppShell>{children}</ProtectedAppShell>
    </AuthProvider>
  );
}
