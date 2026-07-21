import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useActivityLog } from "./use-activity-log";
import { resetWorkflowsForTest } from "@/mocks/handlers";

beforeEach(() => resetWorkflowsForTest());
afterEach(() => resetWorkflowsForTest());

describe("useActivityLog", () => {
  it("워크플로우가 없으면 빈 목록을 반환한다", async () => {
    const { result } = renderHook(() => useActivityLog());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.entries).toEqual([]);
  });

  it("요청된 워크플로우의 이력을 불러온다", async () => {
    await fetch("/api/workflows", {
      method: "POST",
      body: JSON.stringify({
        kind: "franchise_transfer",
        entityId: 1,
        actorId: "cs-manager",
      }),
    });

    const { result } = renderHook(() => useActivityLog());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0]).toMatchObject({
      action: "request",
      actorName: expect.any(String),
      kind: "franchise_transfer",
      domain: "cs",
      entityId: 1,
    });
  });
});
