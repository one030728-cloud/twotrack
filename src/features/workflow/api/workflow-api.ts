import type { ApprovalWorkflow, WorkflowKind } from "@/features/workflow/types";

export async function fetchWorkflow(
  kind: WorkflowKind,
  entityId: number,
): Promise<ApprovalWorkflow | null> {
  const res = await fetch(`/api/workflows?kind=${kind}&entityId=${entityId}`);
  const data = await res.json();
  return data ?? null;
}

export async function requestWorkflow(input: {
  kind: WorkflowKind;
  entityId: number;
  actorId: string;
  payload?: unknown;
}): Promise<ApprovalWorkflow> {
  const res = await fetch("/api/workflows", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function approveWorkflow(
  workflowId: string,
  input: { actorId: string; comment?: string },
): Promise<ApprovalWorkflow> {
  const res = await fetch(`/api/workflows/${workflowId}/approve`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function rejectWorkflow(
  workflowId: string,
  input: { actorId: string; reason: string },
): Promise<ApprovalWorkflow> {
  const res = await fetch(`/api/workflows/${workflowId}/reject`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.json();
}
