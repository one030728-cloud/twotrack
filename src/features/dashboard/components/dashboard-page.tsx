"use client";

import { useState } from "react";
import { CountTabs } from "@/components/ui/count-tabs";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { WorkQueueTable } from "@/features/dashboard/components/work-queue-table";
import { useWorkQueue } from "@/features/dashboard/hooks/use-work-queue";
import {
  WORK_QUEUE_TABS,
  type WorkQueueTabKey,
} from "@/features/dashboard/types";

const EMPTY_MESSAGES: Record<WorkQueueTabKey, string> = {
  all: "표시할 업무가 없습니다.",
  mine: "내가 담당자로 지정된 업무가 없습니다.",
  approvals: "승인 대기 중인 업무가 없습니다.",
  risk: "지연·위험 업무가 없습니다.",
};

export function DashboardPage() {
  const { loading, buckets, counts } = useWorkQueue();
  const [tab, setTab] = useState<WorkQueueTabKey>("all");

  return (
    <PageShell className="gap-4">
      <PageHeader
        title="대시보드"
        description="승인 워크플로우 기준으로 전체 업무, 내 담당 업무, 승인 대기, 지연·위험 업무를 확인합니다."
      />
      <CountTabs
        items={WORK_QUEUE_TABS}
        activeKey={tab}
        counts={counts}
        ariaLabel="업무 현황 필터"
        onChange={setTab}
      />
      {loading ? (
        <p className="text-muted-foreground py-10 text-center text-sm">
          불러오는 중...
        </p>
      ) : (
        <WorkQueueTable
          workflows={buckets[tab]}
          emptyMessage={EMPTY_MESSAGES[tab]}
        />
      )}
    </PageShell>
  );
}
