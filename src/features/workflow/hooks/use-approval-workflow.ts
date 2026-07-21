"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import type { PositionCode } from "@/features/auth/permissions";
import {
  approveWorkflow,
  fetchWorkflow,
  provideWorkflowInfo,
  rejectWorkflow,
  requestWorkflow,
  requestWorkflowInfo,
} from "@/features/workflow/api/workflow-api";
import {
  domainForKind,
  type ApprovalWorkflow,
  type WorkflowKind,
} from "@/features/workflow/types";

export function useApprovalWorkflow(kind: WorkflowKind, entityId: number) {
  const { user } = useAuth();
  const [workflow, setWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await fetchWorkflow(kind, entityId);
    setWorkflow(data);
    setLoading(false);
  }, [kind, entityId]);

  useEffect(() => {
    let cancelled = false;
    fetchWorkflow(kind, entityId).then((data) => {
      if (cancelled) return;
      setWorkflow(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [kind, entityId]);

  const domain = domainForKind(kind);
  const positions = user?.positions ?? [];
  const hasAny = (candidates: PositionCode[]) =>
    candidates.some((p) => positions.includes(p));
  const isRequester = !!user && workflow?.requestedBy === user.id;

  const requestPositions: PositionCode[] =
    domain === "cs" ? ["cs_manager", "master"] : ["tech_manager", "master"];
  const responsiblePositions: PositionCode[] =
    domain === "cs"
      ? ["cs_responsible", "master"]
      : ["tech_responsible", "master"];
  const teamLeadPositions: PositionCode[] = ["team_lead", "master"];

  const canRequest =
    !!user &&
    hasAny(requestPositions) &&
    (!workflow || workflow.stage === "rejected");

  const canApproveResponsible =
    !!user &&
    hasAny(responsiblePositions) &&
    workflow?.stage === "manager_requested" &&
    !isRequester;

  const canApproveTeamLead =
    !!user &&
    hasAny(teamLeadPositions) &&
    workflow?.stage === "responsible_approved" &&
    !isRequester;

  /** 승인 권한자는 승인 대신 반려·추가정보 요청도 할 수 있다 (7.4, 7.5). */
  const canReject = (canApproveResponsible || canApproveTeamLead) && !!workflow;
  const canRequestInfo = canReject;

  const canProvideInfo =
    !!user &&
    workflow?.stage === "information_required" &&
    workflow.pendingInfoTargetId === user.id;

  const request = useCallback(
    async (payload?: unknown) => {
      if (!user) return null;
      const created = await requestWorkflow({
        kind,
        entityId,
        actorId: user.id,
        payload,
      });
      setWorkflow(created);
      return created;
    },
    [kind, entityId, user],
  );

  const approve = useCallback(
    async (comment?: string) => {
      if (!user || !workflow) return null;
      const updated = await approveWorkflow(workflow.id, {
        actorId: user.id,
        comment,
      });
      setWorkflow(updated);
      return updated;
    },
    [user, workflow],
  );

  /** 조건부 수락(7.3): 보완사항·보완 담당자·보완기한·진행 허용 사유가 모두 필요하다. */
  const conditionalApprove = useCallback(
    async (input: {
      allowReason: string;
      followUpNote: string;
      followUpAssigneeId: string;
      followUpDueAt: string;
    }) => {
      if (!user || !workflow) return null;
      const updated = await approveWorkflow(workflow.id, {
        actorId: user.id,
        comment: input.allowReason,
        conditional: true,
        followUpNote: input.followUpNote,
        followUpAssigneeId: input.followUpAssigneeId,
        followUpDueAt: input.followUpDueAt,
      });
      setWorkflow(updated);
      return updated;
    },
    [user, workflow],
  );

  /** 반려(7.4): 사유·재처리 담당자·재처리기한이 모두 필요하다. */
  const reject = useCallback(
    async (input: {
      reason: string;
      reprocessAssigneeId: string;
      reprocessDueAt: string;
    }) => {
      if (!user || !workflow) return null;
      const updated = await rejectWorkflow(workflow.id, {
        actorId: user.id,
        reason: input.reason,
        reprocessAssigneeId: input.reprocessAssigneeId,
        reprocessDueAt: input.reprocessDueAt,
      });
      setWorkflow(updated);
      return updated;
    },
    [user, workflow],
  );

  /** 추가정보 요청(7.5): 응답 전까지 승인 대기 상태를 정지시킨다. */
  const requestInfo = useCallback(
    async (input: { note: string; targetId: string }) => {
      if (!user || !workflow) return null;
      const updated = await requestWorkflowInfo(workflow.id, {
        actorId: user.id,
        note: input.note,
        targetId: input.targetId,
      });
      setWorkflow(updated);
      return updated;
    },
    [user, workflow],
  );

  /** 정보 제공: 원래 승인대기 단계로 복귀한다. */
  const provideInfo = useCallback(
    async (note: string) => {
      if (!user || !workflow) return null;
      const updated = await provideWorkflowInfo(workflow.id, {
        actorId: user.id,
        note,
      });
      setWorkflow(updated);
      return updated;
    },
    [user, workflow],
  );

  return {
    workflow,
    loading,
    reload,
    canRequest,
    canApproveResponsible,
    canApproveTeamLead,
    canReject,
    canRequestInfo,
    canProvideInfo,
    isRequester,
    request,
    approve,
    conditionalApprove,
    reject,
    requestInfo,
    provideInfo,
  };
}
