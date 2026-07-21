import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatPage } from "./chat-page";
import { AUTH_STORAGE_KEY, AuthProvider } from "@/features/auth/auth-provider";
import { resetChatMessagesForTest } from "@/mocks/handlers";

function renderPage() {
  render(
    <AuthProvider>
      <ChatPage />
    </AuthProvider>,
  );
}

beforeEach(() => resetChatMessagesForTest());
afterEach(() => {
  resetChatMessagesForTest();
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
});

describe("ChatPage", () => {
  it("기본 채널(전체)의 메시지를 표시한다", async () => {
    renderPage();

    expect(
      await screen.findByText("이번 주 금요일 전사 회의는 오후 4시입니다."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("카페 아모르 서류 재제출 안내 드렸습니다."),
    ).not.toBeInTheDocument();
  });

  it("채널을 전환하면 해당 채널 메시지만 표시한다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("이번 주 금요일 전사 회의는 오후 4시입니다.");

    await user.click(screen.getByRole("button", { name: "CS팀" }));

    expect(
      await screen.findByText("카페 아모르 서류 재제출 안내 드렸습니다."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("이번 주 금요일 전사 회의는 오후 4시입니다."),
    ).not.toBeInTheDocument();
  });

  it("로그인한 사용자는 메시지를 전송할 수 있다", async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "cs-manager");
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("이번 주 금요일 전사 회의는 오후 4시입니다.");

    await user.type(
      screen.getByLabelText("메시지 입력"),
      "테스트 메시지입니다",
    );
    await user.click(screen.getByRole("button", { name: "전송" }));

    expect(await screen.findByText("테스트 메시지입니다")).toBeInTheDocument();
  });
});
