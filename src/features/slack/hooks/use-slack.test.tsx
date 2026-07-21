import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useSlack } from "./use-slack";
import { AUTH_STORAGE_KEY, AuthProvider } from "@/features/auth/auth-provider";
import { resetSlackMessagesForTest } from "@/mocks/handlers";

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

function loginAs(userId: string) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, userId);
}

beforeEach(() => resetSlackMessagesForTest());
afterEach(() => {
  resetSlackMessagesForTest();
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
});

describe("useSlack", () => {
  it("초기 메시지 3건을 불러온다", async () => {
    const { result } = renderHook(() => useSlack(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.messages).toHaveLength(3);
  });

  it("sendMessage는 로그인한 사용자 이름으로 메시지를 추가한다", async () => {
    loginAs("tech-manager");
    const { result } = renderHook(() => useSlack(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.sendMessage("#긴급", "긴급 출동 요청드립니다");
    });

    expect(result.current.messages).toHaveLength(4);
    const created = result.current.messages.find(
      (m) => m.content === "긴급 출동 요청드립니다",
    );
    expect(created?.senderName).toBe("박기사 매니저");
    expect(created?.channel).toBe("#긴급");
  });
});
