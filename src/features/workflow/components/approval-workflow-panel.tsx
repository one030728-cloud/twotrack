"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { positionLabel } from "@/features/auth/permissions";
import {
  WORKFLOW_STAGE_LABELS,
  type ApprovalWorkflow,
  type WorkflowActionType,
} from "@/features/workflow/types";

const ACTION_LABEL: Record<WorkflowActionType, string> = {
  request: "승인 요청",
  responsible_approve: "책임매니저 승인",
  team_lead_approve: "팀장 승인",
  reject: "반려",
};

const STEP_ORDER = [
  "manager_requested",
  "responsible_approved",
  "team_lead_approved",
] as const;

interface ApprovalWorkflowPanelProps {
  workflow: ApprovalWorkflow | null;
  loading: boolean;
  canRequest: boolean;
  canApproveResponsible: boolean;
  canApproveTeamLead: boolean;
  canReject: boolean;
  requestLabel: string;
  onRequest?: () => void;
  onApprove: (comment?: string) => void;
  onReject: (reason: string) => void;
}

export function ApprovalWorkflowPanel({
  workflow,
  loading,
  canRequest,
  canApproveResponsible,
  canApproveTeamLead,
  canReject,
  requestLabel,
  onRequest,
  onApprove,
  onReject,
}: ApprovalWorkflowPanelProps) {
  const titleId = useId();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (loading) {
    return (
      <p className="text-muted-foreground text-sm">
        승인 현황을 불러오는 중입니다.
      </p>
    );
  }

  const stepIndex = workflow
    ? STEP_ORDER.indexOf(workflow.stage as (typeof STEP_ORDER)[number])
    : -1;

  const submitReject = () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    onReject(trimmed);
    setReason("");
    setRejectOpen(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {workflow?.stage === "rejected" ? (
        <Badge tone="error" className="w-fit">
          반려됨
        </Badge>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {STEP_ORDER.map((stage, index) => (
            <span key={stage} className="flex items-center gap-2">
              <span
                className={[
                  "rounded-full px-2.5 py-1 text-xs font-semibold",
                  index <= stepIndex
                    ? "bg-primary-muted text-primary"
                    : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {WORKFLOW_STAGE_LABELS[stage]}
              </span>
              {index < STEP_ORDER.length - 1 && (
                <span className="text-muted-foreground text-xs">→</span>
              )}
            </span>
          ))}
        </div>
      )}

      {!workflow && (
        <p className="text-muted-foreground text-sm">
          아직 승인 요청이 없습니다.
        </p>
      )}

      {workflow && workflow.history.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {workflow.history.map((entry) => (
            <li
              key={entry.id}
              className="bg-surface-subtle rounded-lg px-3 py-2 text-xs"
            >
              <span className="text-foreground font-semibold">
                {entry.actorName}
                {entry.actorPosition
                  ? ` · ${positionLabel(entry.actorPosition)}`
                  : ""}
              </span>{" "}
              · {ACTION_LABEL[entry.action]}
              {entry.comment ? ` · ${entry.comment}` : ""}
              <span className="text-muted-foreground">
                {" "}
                · {entry.createdAt.slice(0, 16).replace("T", " ")}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        {canRequest && onRequest && (
          <Button variant="secondary" onClick={onRequest}>
            {requestLabel}
          </Button>
        )}
        {(canApproveResponsible || canApproveTeamLead) && (
          <Button variant="primary" onClick={() => onApprove()}>
            {canApproveTeamLead ? "팀장 승인" : "책임매니저 승인"}
          </Button>
        )}
        {canReject && (
          <Button variant="danger" onClick={() => setRejectOpen(true)}>
            반려
          </Button>
        )}
      </div>

      {rejectOpen && (
        <Dialog
          open
          onClose={() => setRejectOpen(false)}
          labelledBy={titleId}
          className="w-[420px]"
        >
          <div className="border-border border-b px-5 py-4">
            <div id={titleId} className="text-foreground font-bold">
              반려 사유
            </div>
          </div>
          <div className="px-5 py-4">
            <Textarea
              label="반려 사유"
              hideLabel
              rows={3}
              placeholder="반려 사유를 입력하세요"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="border-border flex justify-end gap-2 border-t px-5 py-3">
            <Button onClick={() => setRejectOpen(false)}>취소</Button>
            <Button
              variant="danger"
              disabled={!reason.trim()}
              onClick={submitReject}
            >
              반려하기
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
