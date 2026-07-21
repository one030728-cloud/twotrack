import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { DashboardPage } from "./dashboard-page";
import { AUTH_STORAGE_KEY, AuthProvider } from "@/features/auth/auth-provider";
import { resetWorkflowsForTest } from "@/mocks/handlers";

function loginAs(userId: string) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, userId);
}

function renderDashboard() {
  return render(
    <AuthProvider>
      <DashboardPage />
    </AuthProvider>,
  );
}

beforeEach(() => resetWorkflowsForTest());
afterEach(() => {
  resetWorkflowsForTest();
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
});

describe("DashboardPage", () => {
  it("업무 현황 탭 4종을 노출한다", async () => {
    loginAs("cs-lead");
    renderDashboard();

    await waitFor(() =>
      expect(screen.getByText("표시할 업무가 없습니다.")).toBeInTheDocument(),
    );

    expect(screen.getByRole("tab", { name: /전체 업무/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /내 처리함/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /내 승인함/ })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: /지연·위험업무/ }),
    ).toBeInTheDocument();
  });

  it("책임매니저 승인대기 단계는 팀장의 내 승인함에 집계되지 않는다", async () => {
    await fetch("/api/workflows", {
      method: "POST",
      body: JSON.stringify({
        kind: "franchise_transfer",
        entityId: 1,
        actorId: "cs-manager",
      }),
    });

    loginAs("cs-lead");
    renderDashboard();

    await waitFor(() =>
      expect(
        screen.getByRole("tab", { name: /전체 업무 1건/ }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("tab", { name: /내 승인함 0건/ }),
    ).toBeInTheDocument();
  });

  it("팀장 승인대기 단계로 넘어가면 팀장의 내 승인함에 집계된다", async () => {
    await fetch("/api/workflows", {
      method: "POST",
      body: JSON.stringify({
        kind: "franchise_transfer",
        entityId: 2,
        actorId: "cs-manager",
      }),
    });
    const created = await (
      await fetch("/api/workflows?kind=franchise_transfer&entityId=2")
    ).json();
    await fetch(`/api/workflows/${created.id}/approve`, {
      method: "POST",
      body: JSON.stringify({ actorId: "cs-responsible" }),
    });

    loginAs("cs-lead");
    renderDashboard();

    await waitFor(() =>
      expect(
        screen.getByRole("tab", { name: /내 승인함 1건/ }),
      ).toBeInTheDocument(),
    );
  });
});
