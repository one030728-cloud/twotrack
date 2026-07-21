import type { PositionCode } from "@/features/auth/permissions";

/** 승인 결재라인이 속한 팀. 기존 AuthUser.role의 cs/tech 구분과 매핑된다. */
export type WorkflowDomain = "cs" | "tech";

/** 게이트가 걸리는 두 지점: 가맹접수→기술지원 이관, 설치/AS 완료 처리 */
export type WorkflowKind = "franchise_transfer" | "install_completion";

export type WorkflowStage =
  | "manager_requested"
  | "responsible_approved"
  | "team_lead_approved"
  | "information_required"
  | "rejected";

export const WORKFLOW_STAGE_LABELS: Record<WorkflowStage, string> = {
  manager_requested: "책임매니저 승인대기",
  responsible_approved: "팀장 승인대기",
  team_lead_approved: "승인완료",
  information_required: "추가정보 요청",
  rejected: "반려",
};

export function domainForKind(kind: WorkflowKind): WorkflowDomain {
  return kind === "franchise_transfer" ? "cs" : "tech";
}

export type WorkflowActionType =
  | "request"
  | "responsible_approve"
  | "team_lead_approve"
  | "conditional_approve"
  | "request_info"
  | "provide_info"
  | "reject";

export interface WorkflowActionEntry {
  id: string;
  action: WorkflowActionType;
  actorId: string;
  actorName: string;
  actorPosition: PositionCode | null;
  comment: string;
  createdAt: string;
  /** 조건부 수락 시 보완과제 정보 (7.3) */
  followUpNote?: string;
  followUpAssigneeId?: string;
  followUpAssigneeName?: string;
  followUpDueAt?: string;
  /** 반려 시 재처리 담당자·기한 (7.4) */
  reprocessAssigneeId?: string;
  reprocessAssigneeName?: string;
  reprocessDueAt?: string;
  /** 추가정보 요청 대상 (7.5) */
  infoRequestTargetId?: string;
  infoRequestTargetName?: string;
}

export interface ApprovalWorkflow {
  id: string;
  kind: WorkflowKind;
  domain: WorkflowDomain;
  entityId: number;
  stage: WorkflowStage;
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  history: WorkflowActionEntry[];
  /** 추가정보 요청으로 정지되기 전 단계. 정보 제공 시 이 단계로 복귀한다. */
  resumeStage: WorkflowStage | null;
  /** 추가정보를 입력해야 하는 대상자. information_required 상태에서만 값이 있다. */
  pendingInfoTargetId: string | null;
}
