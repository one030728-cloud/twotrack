import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SlackPage } from "./slack-page";
import { AUTH_STORAGE_KEY, AuthProvider } from "@/features/auth/auth-provider";
import { resetSlackMessagesForTest } from "@/mocks/handlers";

function renderPage() {
  render(
    <AuthProvider>
      <SlackPage />
    </AuthProvider>,
  );
}

beforeEach(() => resetSlackMessagesForTest());
afterEach(() => {
  resetSlackMessagesForTest();
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
});

describe("SlackPage", () => {
  it("기본 채널(#일반)의 메시지를 표시한다", async () => {
    renderPage();

    expect(
      await screen.findByText("오늘 오전 시스템 점검이 있었습니다."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("신규 접수 3건 확인 부탁드립니다."),
    ).not.toBeInTheDocument();
  });

  it("채널을 전환하면 해당 채널 메시지만 표시한다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("오늘 오전 시스템 점검이 있었습니다.");

    await user.click(screen.getByRole("button", { name: "가맹접수" }));

    expect(
      await screen.findByText("신규 접수 3건 확인 부탁드립니다."),
    ).toBeInTheDocument();
  });

  it("로그인한 사용자는 메시지를 전송할 수 있다", async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "tech-manager");
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("오늘 오전 시스템 점검이 있었습니다.");

    await user.type(
      screen.getByLabelText("Slack 메시지 입력"),
      "테스트 슬랙 메시지",
    );
    await user.click(screen.getByRole("button", { name: "전송" }));

    expect(await screen.findByText("테스트 슬랙 메시지")).toBeInTheDocument();
  });
});
