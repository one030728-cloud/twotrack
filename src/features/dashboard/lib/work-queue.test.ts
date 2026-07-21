import { describe, expect, it } from "vitest";
import {
  DUE_SOON_DAYS,
  getPendingDue,
  getRiskReasons,
  isMyApproval,
  isMyTask,
} from "./work-queue";
import type {
  ApprovalWorkflow,
  WorkflowActionEntry,
} from "@/features/workflow/types";

function makeEntry(
  overrides: Partial<WorkflowActionEntry>,
): WorkflowActionEntry {
  return {
    id: "action-1",
    action: "request",
    actorId: "cs-manager",
    actorName: "정지은 매니저",
    actorPosition: "cs_manager",
    comment: "",
    createdAt: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeWorkflow(
  overrides: Partial<ApprovalWorkflow>,
  history: WorkflowActionEntry[] = [],
): ApprovalWorkflow {
  return {
    id: "wf-1",
    kind: "franchise_transfer",
    domain: "cs",
    entityId: 1,
    stage: "manager_requested",
    requestedBy: "cs-manager",
    requestedByName: "정지은 매니저",
    requestedAt: "2026-07-01T00:00:00.000Z",
    history,
    resumeStage: null,
    pendingInfoTargetId: null,
    ...overrides,
  };
}

describe("isMyApproval", () => {
  it("manager_requested 단계는 해당 도메인의 책임매니저·마스터만 승인 대상", () => {
    const workflow = makeWorkflow({ stage: "manager_requested", domain: "cs" });
    expect(
      isMyApproval(workflow, {
        id: "cs-responsible",
        positions: ["cs_responsible"],
      }),
    ).toBe(true);
    expect(
      isMyApproval(workflow, {
        id: "tech-responsible",
        positions: ["tech_responsible"],
      }),
    ).toBe(false);
    expect(
      isMyApproval(workflow, { id: "master", positions: ["master"] }),
    ).toBe(true);
  });

  it("responsible_approved 단계는 팀장·마스터만 승인 대상", () => {
    const workflow = makeWorkflow({
      stage: "responsible_approved",
      domain: "tech",
    });
    expect(
      isMyApproval(workflow, { id: "tech-lead", positions: ["team_lead"] }),
    ).toBe(true);
    expect(
      isMyApproval(workflow, {
        id: "tech-responsible",
        positions: ["tech_responsible"],
      }),
    ).toBe(false);
  });

  it("본인이 요청한 업무는 본인 승인 대상에서 제외한다", () => {
    const workflow = makeWorkflow({
      stage: "manager_requested",
      domain: "cs",
      requestedBy: "cs-responsible",
    });
    expect(
      isMyApproval(workflow, {
        id: "cs-responsible",
        positions: ["cs_responsible"],
      }),
    ).toBe(false);
  });

  it("완료·반려 단계는 승인 대상이 아니다", () => {
    const approved = makeWorkflow({ stage: "team_lead_approved" });
    const rejected = makeWorkflow({ stage: "rejected" });
    expect(
      isMyApproval(approved, { id: "master", positions: ["master"] }),
    ).toBe(false);
    expect(
      isMyApproval(rejected, { id: "master", positions: ["master"] }),
    ).toBe(false);
  });
});

describe("isMyTask", () => {
  it("요청자 본인은 내 업무로 집계된다", () => {
    const workflow = makeWorkflow({ requestedBy: "tech-manager" });
    expect(isMyTask(workflow, { id: "tech-manager" })).toBe(true);
  });

  it("추가정보 요청 대상자는 내 업무로 집계된다", () => {
    const workflow = makeWorkflow({
      stage: "information_required",
      pendingInfoTargetId: "tech-manager",
    });
    expect(isMyTask(workflow, { id: "tech-manager" })).toBe(true);
    expect(isMyTask(workflow, { id: "tech-responsible" })).toBe(false);
  });

  it("반려 재처리 담당자는 내 업무로 집계된다", () => {
    const workflow = makeWorkflow({ stage: "rejected" }, [
      makeEntry({
        action: "reject",
        reprocessAssigneeId: "tech-manager",
        reprocessDueAt: "2026-07-10",
      }),
    ]);
    expect(isMyTask(workflow, { id: "tech-manager" })).toBe(true);
  });

  it("조건부 승인 보완 담당자는 내 업무로 집계된다", () => {
    const workflow = makeWorkflow({ stage: "responsible_approved" }, [
      makeEntry({
        action: "conditional_approve",
        followUpAssigneeId: "tech-manager",
        followUpDueAt: "2026-07-10",
      }),
    ]);
    expect(isMyTask(workflow, { id: "tech-manager" })).toBe(true);
    expect(isMyTask(workflow, { id: "tech-responsible" })).toBe(false);
  });
});

describe("getPendingDue / getRiskReasons", () => {
  it("반려 상태의 마지막 이력에서 재처리 마감을 뽑아낸다", () => {
    const workflow = makeWorkflow({ stage: "rejected" }, [
      makeEntry({
        action: "reject",
        reprocessAssigneeId: "tech-manager",
        reprocessAssigneeName: "박기사 매니저",
        reprocessDueAt: "2026-07-10",
      }),
    ]);
    expect(getPendingDue(workflow)).toEqual({
      dueAt: "2026-07-10",
      assigneeId: "tech-manager",
      assigneeName: "박기사 매니저",
      reason: "reprocess",
    });
  });

  it("마감이 없는 업무는 위험 사유가 비어있다", () => {
    const workflow = makeWorkflow({ stage: "manager_requested" });
    expect(getRiskReasons(workflow, new Date("2026-07-01"))).toEqual([]);
  });

  it("정보 미등록 상태는 항상 위험 사유에 포함된다", () => {
    const workflow = makeWorkflow({ stage: "information_required" });
    expect(getRiskReasons(workflow, new Date("2026-07-01"))).toContain(
      "info_required",
    );
  });

  it(`마감까지 ${DUE_SOON_DAYS}일 이내면 마감 임박, 지나면 마감 초과로 분류한다`, () => {
    const workflow = makeWorkflow({ stage: "rejected" }, [
      makeEntry({
        action: "reject",
        reprocessAssigneeId: "tech-manager",
        reprocessDueAt: "2026-07-10",
      }),
    ]);
    expect(getRiskReasons(workflow, new Date("2026-07-08"))).toContain(
      "due_soon",
    );
    expect(getRiskReasons(workflow, new Date("2026-07-11"))).toContain(
      "overdue",
    );
    expect(getRiskReasons(workflow, new Date("2026-06-01"))).toEqual([]);
  });
});
