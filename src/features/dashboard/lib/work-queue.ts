import type { AuthUser, PositionCode } from "@/features/auth/permissions";
import type { ApprovalWorkflow } from "@/features/workflow/types";

/** 마감이 이 일수 이내로 다가오면 "마감 임박"으로 간주한다. */
export const DUE_SOON_DAYS = 3;

function hasAny(positions: PositionCode[], candidates: PositionCode[]) {
  return candidates.some((position) => positions.includes(position));
}

/** 현재 단계에서 승인 권한을 갖는 직책. 승인이 필요 없는 단계는 null. */
function approvalPositions(workflow: ApprovalWorkflow): PositionCode[] | null {
  if (workflow.stage === "manager_requested") {
    return workflow.domain === "cs"
      ? ["cs_responsible", "master"]
      : ["tech_responsible", "master"];
  }
  if (workflow.stage === "responsible_approved") {
    return ["team_lead", "master"];
  }
  return null;
}

/** 내 직책 기준으로 지금 승인 대기 중인 업무인지 (use-approval-workflow의 canApprove* 조건과 동일). */
export function isMyApproval(
  workflow: ApprovalWorkflow,
  user: Pick<AuthUser, "id" | "positions">,
): boolean {
  if (workflow.requestedBy === user.id) return false;
  const positions = approvalPositions(workflow);
  if (!positions) return false;
  return hasAny(user.positions, positions);
}

/** 내가 담당자로 지정된 업무인지 (요청자·정보 제공 대상·재처리/보완 담당자). */
export function isMyTask(
  workflow: ApprovalWorkflow,
  user: Pick<AuthUser, "id">,
): boolean {
  if (workflow.requestedBy === user.id) return true;
  if (
    workflow.stage === "information_required" &&
    workflow.pendingInfoTargetId === user.id
  ) {
    return true;
  }
  const last = workflow.history.at(-1);
  if (!last) return false;
  if (
    workflow.stage === "rejected" &&
    last.action === "reject" &&
    last.reprocessAssigneeId === user.id
  ) {
    return true;
  }
  if (
    last.action === "conditional_approve" &&
    last.followUpAssigneeId === user.id
  ) {
    return true;
  }
  return false;
}

export type PendingDueReason = "reprocess" | "follow_up";

export interface PendingDue {
  dueAt: string;
  assigneeId: string | null;
  assigneeName: string | null;
  reason: PendingDueReason;
}

/** 가장 최근 이력에서 아직 처리되지 않은 마감(반려 재처리 / 조건부 승인 보완)을 뽑아낸다. */
export function getPendingDue(workflow: ApprovalWorkflow): PendingDue | null {
  const last = workflow.history.at(-1);
  if (!last) return null;

  if (
    workflow.stage === "rejected" &&
    last.action === "reject" &&
    last.reprocessDueAt
  ) {
    return {
      dueAt: last.reprocessDueAt,
      assigneeId: last.reprocessAssigneeId ?? null,
      assigneeName: last.reprocessAssigneeName ?? null,
      reason: "reprocess",
    };
  }

  if (last.action === "conditional_approve" && last.followUpDueAt) {
    return {
      dueAt: last.followUpDueAt,
      assigneeId: last.followUpAssigneeId ?? null,
      assigneeName: last.followUpAssigneeName ?? null,
      reason: "follow_up",
    };
  }

  return null;
}

export type RiskReason = "info_required" | "overdue" | "due_soon";

/** 지연·위험 사유 목록. 정보 미등록 상태이거나, 마감이 임박·초과한 경우. */
export function getRiskReasons(
  workflow: ApprovalWorkflow,
  now: Date = new Date(),
): RiskReason[] {
  const reasons: RiskReason[] = [];
  if (workflow.stage === "information_required") {
    reasons.push("info_required");
  }

  const pending = getPendingDue(workflow);
  if (pending) {
    const diffDays =
      (new Date(pending.dueAt).getTime() - now.getTime()) /
      (1000 * 60 * 60 * 24);
    if (diffDays < 0) reasons.push("overdue");
    else if (diffDays <= DUE_SOON_DAYS) reasons.push("due_soon");
  }

  return reasons;
}
