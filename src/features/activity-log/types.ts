import type {
  ApprovalWorkflow,
  WorkflowActionType,
  WorkflowDomain,
  WorkflowKind,
} from "@/features/workflow/types";
import type { PositionCode } from "@/features/auth/permissions";

export const WORKFLOW_KIND_LABELS: Record<WorkflowKind, string> = {
  franchise_transfer: "가맹 접수 이관",
  install_completion: "설치/AS 완료",
};

export const WORKFLOW_DOMAIN_LABELS: Record<WorkflowDomain, string> = {
  cs: "CS",
  tech: "기술지원",
};

export const WORKFLOW_ACTION_LABELS: Record<WorkflowActionType, string> = {
  request: "완료요청",
  responsible_approve: "책임매니저 승인",
  team_lead_approve: "팀장 승인",
  conditional_approve: "조건부 승인",
  request_info: "추가정보 요청",
  provide_info: "정보 제공",
  reject: "반려",
};

/** 승인 워크플로우 이력 한 건을 화면에 표시할 수 있도록 평탄화한 단위. */
export interface ActivityLogEntry {
  id: string;
  workflowId: string;
  kind: WorkflowKind;
  domain: WorkflowDomain;
  entityId: number;
  action: WorkflowActionType;
  actorName: string;
  actorPosition: PositionCode | null;
  comment: string;
  createdAt: string;
}

/** 워크플로우 목록을 이력 항목 단위로 펼쳐서 최신순으로 정렬한다. */
export function flattenWorkflows(
  workflows: ApprovalWorkflow[],
): ActivityLogEntry[] {
  const entries: ActivityLogEntry[] = [];
  for (const workflow of workflows) {
    for (const action of workflow.history) {
      entries.push({
        id: action.id,
        workflowId: workflow.id,
        kind: workflow.kind,
        domain: workflow.domain,
        entityId: workflow.entityId,
        action: action.action,
        actorName: action.actorName,
        actorPosition: action.actorPosition,
        comment: action.comment,
        createdAt: action.createdAt,
      });
    }
  }
  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
