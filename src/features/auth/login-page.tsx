"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogInIcon } from "lucide-react";
import { LogoMark } from "@/components/layout/logo-mark";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { login as loginRequest } from "@/features/auth/api/auth-api";

export function LoginPage() {
  const router = useRouter();
  const { ready, user, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, router, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const authUser = await loginRequest({
        username: username.trim(),
        password,
      });
      login(authUser);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-background flex min-h-dvh flex-1 items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex items-center justify-center gap-2">
          <LogoMark className="size-9" />
          <span className="text-foreground text-xl font-bold">POSMOS</span>
        </div>
        <section className="border-border bg-card shadow-card rounded-lg border p-6">
          <h1 className="text-foreground text-xl font-bold">로그인</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            아이디와 비밀번호를 입력해 전산 시스템에 접속합니다.
          </p>
          <form className="mt-5 flex flex-col gap-3" onSubmit={handleSubmit}>
            <Input
              label="아이디"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              label="비밀번호"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <p role="alert" className="text-error text-xs">
                {error}
              </p>
            )}
            <Button
              type="submit"
              variant="primary"
              disabled={!username.trim() || !password || submitting}
              className="mt-1 justify-center"
            >
              <LogInIcon className="size-4" />
              로그인
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
