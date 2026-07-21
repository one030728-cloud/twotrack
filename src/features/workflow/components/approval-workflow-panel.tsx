"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { positionLabel } from "@/features/auth/permissions";
import { useEmployees } from "@/features/employees/hooks/use-employees";
import {
  WORKFLOW_STAGE_LABELS,
  type ApprovalWorkflow,
  type WorkflowActionType,
} from "@/features/workflow/types";

const ACTION_LABEL: Record<WorkflowActionType, string> = {
  request: "승인 요청",
  responsible_approve: "책임매니저 승인",
  team_lead_approve: "팀장 승인",
  conditional_approve: "조건부 승인",
  request_info: "추가정보 요청",
  provide_info: "정보 제공",
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
  canRequestInfo?: boolean;
  canProvideInfo?: boolean;
  requestLabel: string;
  onRequest?: () => void;
  onApprove: (comment?: string) => void;
  onConditionalApprove?: (input: {
    allowReason: string;
    followUpNote: string;
    followUpAssigneeId: string;
    followUpDueAt: string;
  }) => void;
  onReject: (input: {
    reason: string;
    reprocessAssigneeId: string;
    reprocessDueAt: string;
  }) => void;
  onRequestInfo?: (input: { note: string; targetId: string }) => void;
  onProvideInfo?: (note: string) => void;
}

export function ApprovalWorkflowPanel({
  workflow,
  loading,
  canRequest,
  canApproveResponsible,
  canApproveTeamLead,
  canReject,
  canRequestInfo = false,
  canProvideInfo = false,
  requestLabel,
  onRequest,
  onApprove,
  onConditionalApprove,
  onReject,
  onRequestInfo,
  onProvideInfo,
}: ApprovalWorkflowPanelProps) {
  const titleId = useId();
  const { employees } = useEmployees();
  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name,
  }));

  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reprocessAssigneeId, setReprocessAssigneeId] = useState("");
  const [reprocessDueAt, setReprocessDueAt] = useState("");

  const [conditionalOpen, setConditionalOpen] = useState(false);
  const [allowReason, setAllowReason] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const [followUpAssigneeId, setFollowUpAssigneeId] = useState("");
  const [followUpDueAt, setFollowUpDueAt] = useState("");

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoNote, setInfoNote] = useState("");
  const [infoTargetId, setInfoTargetId] = useState("");

  const [provideOpen, setProvideOpen] = useState(false);
  const [provideNote, setProvideNote] = useState("");

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
    const trimmedReason = reason.trim();
    if (!trimmedReason || !reprocessAssigneeId || !reprocessDueAt) return;
    onReject({
      reason: trimmedReason,
      reprocessAssigneeId,
      reprocessDueAt,
    });
    setReason("");
    setReprocessAssigneeId("");
    setReprocessDueAt("");
    setRejectOpen(false);
  };

  const submitConditional = () => {
    const trimmedAllowReason = allowReason.trim();
    const trimmedFollowUpNote = followUpNote.trim();
    if (
      !trimmedAllowReason ||
      !trimmedFollowUpNote ||
      !followUpAssigneeId ||
      !followUpDueAt ||
      !onConditionalApprove
    ) {
      return;
    }
    onConditionalApprove({
      allowReason: trimmedAllowReason,
      followUpNote: trimmedFollowUpNote,
      followUpAssigneeId,
      followUpDueAt,
    });
    setAllowReason("");
    setFollowUpNote("");
    setFollowUpAssigneeId("");
    setFollowUpDueAt("");
    setConditionalOpen(false);
  };

  const submitInfoRequest = () => {
    const trimmedNote = infoNote.trim();
    if (!trimmedNote || !infoTargetId || !onRequestInfo) return;
    onRequestInfo({ note: trimmedNote, targetId: infoTargetId });
    setInfoNote("");
    setInfoTargetId("");
    setInfoOpen(false);
  };

  const submitProvideInfo = () => {
    const trimmedNote = provideNote.trim();
    if (!trimmedNote || !onProvideInfo) return;
    onProvideInfo(trimmedNote);
    setProvideNote("");
    setProvideOpen(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {workflow?.stage === "rejected" ? (
        <Badge tone="error" className="w-fit">
          반려됨
        </Badge>
      ) : workflow?.stage === "information_required" ? (
        <Badge tone="primary" className="w-fit">
          추가정보 요청됨
          {workflow.pendingInfoTargetId
            ? ` · ${
                employees.find((e) => e.id === workflow.pendingInfoTargetId)
                  ?.name ?? ""
              } 응답 대기`
            : ""}
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
              {entry.action === "conditional_approve" && (
                <span className="text-muted-foreground">
                  {" "}
                  · 보완: {entry.followUpNote} ({entry.followUpAssigneeName}, ~
                  {entry.followUpDueAt})
                </span>
              )}
              {entry.action === "reject" && entry.reprocessAssigneeName && (
                <span className="text-muted-foreground">
                  {" "}
                  · 재처리: {entry.reprocessAssigneeName} (~
                  {entry.reprocessDueAt})
                </span>
              )}
              {entry.action === "request_info" &&
                entry.infoRequestTargetName && (
                  <span className="text-muted-foreground">
                    {" "}
                    · 요청 대상: {entry.infoRequestTargetName}
                  </span>
                )}
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
        {(canApproveResponsible || canApproveTeamLead) &&
          onConditionalApprove && (
            <Button
              variant="secondary"
              onClick={() => setConditionalOpen(true)}
            >
              조건부 승인
            </Button>
          )}
        {canRequestInfo && onRequestInfo && (
          <Button variant="secondary" onClick={() => setInfoOpen(true)}>
            추가정보 요청
          </Button>
        )}
        {canReject && (
          <Button variant="danger" onClick={() => setRejectOpen(true)}>
            반려
          </Button>
        )}
        {canProvideInfo && onProvideInfo && (
          <Button variant="primary" onClick={() => setProvideOpen(true)}>
            정보 제공
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
              반려
            </div>
          </div>
          <div className="flex flex-col gap-3 px-5 py-4">
            <Textarea
              label="반려 사유"
              rows={3}
              placeholder="반려 사유를 입력하세요"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Select
              label="재처리 담당자"
              value={reprocessAssigneeId || null}
              onValueChange={setReprocessAssigneeId}
              options={employeeOptions}
              placeholder="담당자 선택"
            />
            <Input
              label="재처리기한"
              type="date"
              value={reprocessDueAt}
              onChange={(e) => setReprocessDueAt(e.target.value)}
            />
          </div>
          <div className="border-border flex justify-end gap-2 border-t px-5 py-3">
            <Button onClick={() => setRejectOpen(false)}>취소</Button>
            <Button
              variant="danger"
              disabled={
                !reason.trim() || !reprocessAssigneeId || !reprocessDueAt
              }
              onClick={submitReject}
            >
              반려하기
            </Button>
          </div>
        </Dialog>
      )}

      {conditionalOpen && (
        <Dialog
          open
          onClose={() => setConditionalOpen(false)}
          labelledBy={`${titleId}-conditional`}
          className="w-[420px]"
        >
          <div className="border-border border-b px-5 py-4">
            <div
              id={`${titleId}-conditional`}
              className="text-foreground font-bold"
            >
              조건부 승인
            </div>
          </div>
          <div className="flex flex-col gap-3 px-5 py-4">
            <Textarea
              label="진행을 허용하는 사유"
              rows={2}
              value={allowReason}
              onChange={(e) => setAllowReason(e.target.value)}
            />
            <Textarea
              label="보완사항"
              rows={2}
              value={followUpNote}
              onChange={(e) => setFollowUpNote(e.target.value)}
            />
            <Select
              label="보완 담당자"
              value={followUpAssigneeId || null}
              onValueChange={setFollowUpAssigneeId}
              options={employeeOptions}
              placeholder="담당자 선택"
            />
            <Input
              label="보완기한"
              type="date"
              value={followUpDueAt}
              onChange={(e) => setFollowUpDueAt(e.target.value)}
            />
          </div>
          <div className="border-border flex justify-end gap-2 border-t px-5 py-3">
            <Button onClick={() => setConditionalOpen(false)}>취소</Button>
            <Button
              variant="primary"
              disabled={
                !allowReason.trim() ||
                !followUpNote.trim() ||
                !followUpAssigneeId ||
                !followUpDueAt
              }
              onClick={submitConditional}
            >
              조건부 승인하기
            </Button>
          </div>
        </Dialog>
      )}

      {infoOpen && (
        <Dialog
          open
          onClose={() => setInfoOpen(false)}
          labelledBy={`${titleId}-info`}
          className="w-[420px]"
        >
          <div className="border-border border-b px-5 py-4">
            <div id={`${titleId}-info`} className="text-foreground font-bold">
              추가정보 요청
            </div>
          </div>
          <div className="flex flex-col gap-3 px-5 py-4">
            <Select
              label="요청 대상자"
              value={infoTargetId || null}
              onValueChange={setInfoTargetId}
              options={employeeOptions}
              placeholder="대상자 선택"
            />
            <Textarea
              label="요청 내용"
              rows={3}
              value={infoNote}
              onChange={(e) => setInfoNote(e.target.value)}
            />
          </div>
          <div className="border-border flex justify-end gap-2 border-t px-5 py-3">
            <Button onClick={() => setInfoOpen(false)}>취소</Button>
            <Button
              variant="primary"
              disabled={!infoNote.trim() || !infoTargetId}
              onClick={submitInfoRequest}
            >
              요청하기
            </Button>
          </div>
        </Dialog>
      )}

      {provideOpen && (
        <Dialog
          open
          onClose={() => setProvideOpen(false)}
          labelledBy={`${titleId}-provide`}
          className="w-[420px]"
        >
          <div className="border-border border-b px-5 py-4">
            <div
              id={`${titleId}-provide`}
              className="text-foreground font-bold"
            >
              정보 제공
            </div>
          </div>
          <div className="px-5 py-4">
            <Textarea
              label="요청받은 추가정보"
              rows={3}
              value={provideNote}
              onChange={(e) => setProvideNote(e.target.value)}
            />
          </div>
          <div className="border-border flex justify-end gap-2 border-t px-5 py-3">
            <Button onClick={() => setProvideOpen(false)}>취소</Button>
            <Button
              variant="primary"
              disabled={!provideNote.trim()}
              onClick={submitProvideInfo}
            >
              제출하기
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
