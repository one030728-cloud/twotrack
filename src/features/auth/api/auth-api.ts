import type { AuthUser } from "@/features/auth/permissions";

export interface LoginInput {
  username: string;
  password: string;
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "로그인에 실패했습니다.");
  }
  return res.json();
}
