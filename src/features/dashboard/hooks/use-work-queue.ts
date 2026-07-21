"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import {
  getRiskReasons,
  isMyApproval,
  isMyTask,
} from "@/features/dashboard/lib/work-queue";
import type { WorkQueueTabKey } from "@/features/dashboard/types";
import { fetchAllWorkflows } from "@/features/workflow/api/workflow-api";
import type { ApprovalWorkflow } from "@/features/workflow/types";

export function useWorkQueue() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAllWorkflows().then((data) => {
      if (cancelled) return;
      setWorkflows(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const buckets = useMemo<Record<WorkQueueTabKey, ApprovalWorkflow[]>>(() => {
    if (!user) return { all: [], mine: [], approvals: [], risk: [] };
    const now = new Date();
    return {
      all: workflows,
      mine: workflows.filter((workflow) => isMyTask(workflow, user)),
      approvals: workflows.filter((workflow) => isMyApproval(workflow, user)),
      risk: workflows.filter(
        (workflow) => getRiskReasons(workflow, now).length > 0,
      ),
    };
  }, [workflows, user]);

  const counts: Record<WorkQueueTabKey, number> = {
    all: buckets.all.length,
    mine: buckets.mine.length,
    approvals: buckets.approvals.length,
    risk: buckets.risk.length,
  };

  return { loading, buckets, counts };
}
