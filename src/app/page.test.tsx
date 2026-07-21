import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "./page";
import { AUTH_STORAGE_KEY, AuthProvider } from "@/features/auth/auth-provider";
import { resetWorkflowsForTest } from "@/mocks/handlers";

function loginAs(userId: string) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, userId);
}

beforeEach(() => resetWorkflowsForTest());
afterEach(() => {
  resetWorkflowsForTest();
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
});

describe("Home", () => {
  it("일반 직책 사용자에게는 안내 화면을 보여준다", async () => {
    loginAs("cs-manager");
    render(
      <AuthProvider>
        <Home />
      </AuthProvider>,
    );
    expect(
      await screen.findByRole("heading", { name: "POSMOS 전산 시스템" }),
    ).toBeInTheDocument();
  });

  it("팀장·마스터 직책 사용자에게는 업무 현황 대시보드를 보여준다", async () => {
    loginAs("cs-lead");
    render(
      <AuthProvider>
        <Home />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(
        screen.getByRole("tab", { name: /전체 업무/ }),
      ).toBeInTheDocument(),
    );
  });
});
