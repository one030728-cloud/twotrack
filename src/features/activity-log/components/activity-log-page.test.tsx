import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ActivityLogPage } from "./activity-log-page";
import { resetWorkflowsForTest } from "@/mocks/handlers";

beforeEach(() => resetWorkflowsForTest());
afterEach(() => resetWorkflowsForTest());

describe("ActivityLogPage", () => {
  it("활동 이력이 없으면 안내 문구를 표시한다", async () => {
    render(<ActivityLogPage />);

    expect(
      await screen.findByText("조건에 맞는 활동 이력이 없습니다."),
    ).toBeInTheDocument();
  });

  it("워크플로우 요청 이력을 목록에 표시한다", async () => {
    await fetch("/api/workflows", {
      method: "POST",
      body: JSON.stringify({
        kind: "franchise_transfer",
        entityId: 1,
        actorId: "cs-manager",
      }),
    });

    render(<ActivityLogPage />);

    await waitFor(() =>
      expect(screen.getByText("완료요청")).toBeInTheDocument(),
    );
    expect(screen.getByText("가맹 접수 이관 · #1")).toBeInTheDocument();
  });
});
