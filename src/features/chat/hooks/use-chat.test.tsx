import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useChat } from "./use-chat";
import { AUTH_STORAGE_KEY, AuthProvider } from "@/features/auth/auth-provider";
import { resetChatMessagesForTest } from "@/mocks/handlers";

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

function loginAs(userId: string) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, userId);
}

beforeEach(() => resetChatMessagesForTest());
afterEach(() => {
  resetChatMessagesForTest();
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
});

describe("useChat", () => {
  it("초기 메시지 3건을 불러온다", async () => {
    const { result } = renderHook(() => useChat(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.messages).toHaveLength(3);
  });

  it("sendMessage는 로그인한 사용자 이름으로 메시지를 추가한다", async () => {
    loginAs("cs-manager");
    const { result } = renderHook(() => useChat(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.sendMessage("cs", "안녕하세요");
    });

    expect(result.current.messages).toHaveLength(4);
    const created = result.current.messages.find(
      (m) => m.content === "안녕하세요",
    );
    expect(created?.authorName).toBe("정지은 매니저");
    expect(created?.channelId).toBe("cs");
  });
});
