"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import type { PositionCode } from "@/features/auth/permissions";
import {
  approveWorkflow,
  fetchWorkflow,
  rejectWorkflow,
  requestWorkflow,
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

  const canReject = (canApproveResponsible || canApproveTeamLead) && !!workflow;

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

  const reject = useCallback(
    async (reason: string) => {
      if (!user || !workflow) return null;
      const updated = await rejectWorkflow(workflow.id, {
        actorId: user.id,
        reason,
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
    isRequester,
    request,
    approve,
    reject,
  };
}
