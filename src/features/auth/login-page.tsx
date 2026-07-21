"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogInIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/layout/logo-mark";
import { useAuth } from "@/features/auth/auth-provider";
import {
  MOCK_USERS,
  roleLabel,
  type UserRole,
} from "@/features/auth/permissions";

const ROLE_DESCRIPTION: Record<UserRole, string> = {
  admin: "전체 메뉴와 권한 관리 화면을 사용할 수 있습니다.",
  cs: "가맹 접수, 변경 관리, 우국상, 인터넷 관리를 사용할 수 있습니다.",
  tech: "설치 관리와 매장 운영 이력을 사용할 수 있습니다.",
  viewer: "운영 화면을 조회 전용으로 확인합니다.",
};

export function LoginPage() {
  const router = useRouter();
  const { ready, user, login } = useAuth();

  useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, router, user]);

  const handleLogin = (role: UserRole) => {
    login(role);
    router.replace("/");
  };

  return (
    <main className="bg-background flex min-h-dvh flex-1 items-center justify-center p-6">
      <div className="w-full max-w-[460px]">
        <div className="mb-6 flex items-center justify-center gap-2">
          <LogoMark className="size-9" />
          <span className="text-foreground text-xl font-bold">POSMOS</span>
        </div>
        <section className="border-border bg-card shadow-card rounded-lg border p-6">
          <h1 className="text-foreground text-xl font-bold">로그인</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            테스트할 역할을 선택해 전산 시스템에 접속합니다.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            {MOCK_USERS.map((mockUser) => (
              <button
                key={mockUser.id}
                type="button"
                onClick={() => handleLogin(mockUser.role)}
                className="border-border hover:border-primary/50 hover:bg-surface-subtle flex items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left"
              >
                <span>
                  <span className="text-foreground block text-sm font-bold">
                    {mockUser.name}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-xs">
                    {mockUser.team} · {roleLabel(mockUser.role)}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-xs">
                    {ROLE_DESCRIPTION[mockUser.role]}
                  </span>
                </span>
                <LogInIcon className="text-primary size-4 shrink-0" />
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            className="mt-5 w-full"
            onClick={() => handleLogin("cs")}
          >
            CS 계정으로 로그인
          </Button>
        </section>
      </div>
    </main>
  );
}
