import { describe, expect, it } from "vitest";
import { flattenWorkflows } from "./types";
import type { ApprovalWorkflow } from "@/features/workflow/types";

function makeWorkflow(
  overrides: Partial<ApprovalWorkflow> = {},
): ApprovalWorkflow {
  return {
    id: "wf-1",
    kind: "franchise_transfer",
    domain: "cs",
    entityId: 1,
    stage: "manager_requested",
    requestedBy: "cs-manager",
    requestedByName: "정지은 매니저",
    requestedAt: "2026-07-17T10:00:00.000Z",
    history: [
      {
        id: "wf-action-1",
        action: "request",
        actorId: "cs-manager",
        actorName: "정지은 매니저",
        actorPosition: "cs_manager",
        comment: "",
        createdAt: "2026-07-17T10:00:00.000Z",
      },
    ],
    resumeStage: null,
    pendingInfoTargetId: null,
    ...overrides,
  };
}

describe("flattenWorkflows", () => {
  it("여러 워크플로우의 이력을 하나의 목록으로 펼친다", () => {
    const workflows = [
      makeWorkflow({
        id: "wf-1",
        history: [
          {
            id: "a1",
            action: "request",
            actorId: "cs-manager",
            actorName: "정지은",
            actorPosition: "cs_manager",
            comment: "",
            createdAt: "2026-07-17T10:00:00.000Z",
          },
          {
            id: "a2",
            action: "responsible_approve",
            actorId: "cs-resp",
            actorName: "박책임",
            actorPosition: "cs_responsible",
            comment: "확인",
            createdAt: "2026-07-17T11:00:00.000Z",
          },
        ],
      }),
      makeWorkflow({
        id: "wf-2",
        kind: "install_completion",
        domain: "tech",
        entityId: 2,
        history: [
          {
            id: "b1",
            action: "request",
            actorId: "tech-manager",
            actorName: "김기술",
            actorPosition: "tech_manager",
            comment: "",
            createdAt: "2026-07-17T09:00:00.000Z",
          },
        ],
      }),
    ];

    const entries = flattenWorkflows(workflows);

    expect(entries).toHaveLength(3);
    expect(entries.map((e) => e.id)).toEqual(["a2", "a1", "b1"]);
  });

  it("워크플로우가 없으면 빈 배열을 반환한다", () => {
    expect(flattenWorkflows([])).toEqual([]);
  });
});
