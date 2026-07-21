import type { PositionCode } from "@/features/auth/permissions";

/** 승인 결재라인이 속한 팀. 기존 AuthUser.role의 cs/tech 구분과 매핑된다. */
export type WorkflowDomain = "cs" | "tech";

/** 게이트가 걸리는 두 지점: 가맹접수→기술지원 이관, 설치/AS 완료 처리 */
export type WorkflowKind = "franchise_transfer" | "install_completion";

export type WorkflowStage =
  | "manager_requested"
  | "responsible_approved"
  | "team_lead_approved"
  | "rejected";

export const WORKFLOW_STAGE_LABELS: Record<WorkflowStage, string> = {
  manager_requested: "책임매니저 승인대기",
  responsible_approved: "팀장 승인대기",
  team_lead_approved: "승인완료",
  rejected: "반려",
};

export function domainForKind(kind: WorkflowKind): WorkflowDomain {
  return kind === "franchise_transfer" ? "cs" : "tech";
}

export type WorkflowActionType =
  "request" | "responsible_approve" | "team_lead_approve" | "reject";

export interface WorkflowActionEntry {
  id: string;
  action: WorkflowActionType;
  actorId: string;
  actorName: string;
  actorPosition: PositionCode | null;
  comment: string;
  createdAt: string;
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
}
