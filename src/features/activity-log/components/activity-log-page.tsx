"use client";

import { useMemo, useState } from "react";
import { HistoryIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { positionLabel } from "@/features/auth/permissions";
import { useActivityLog } from "@/features/activity-log/hooks/use-activity-log";
import {
  WORKFLOW_ACTION_LABELS,
  WORKFLOW_DOMAIN_LABELS,
  WORKFLOW_KIND_LABELS,
} from "@/features/activity-log/types";
import type { WorkflowDomain } from "@/features/workflow/types";

type DomainTab = "all" | WorkflowDomain;

const DOMAIN_TABS: DomainTab[] = ["all", "cs", "tech"];

export function ActivityLogPage() {
  const { loading, entries } = useActivityLog();
  const [query, setQuery] = useState("");
  const [domainTab, setDomainTab] = useState<DomainTab>("all");

  const filteredEntries = useMemo(() => {
    const normalized = query.trim();
    return entries.filter((entry) => {
      if (domainTab !== "all" && entry.domain !== domainTab) return false;
      if (!normalized) return true;
      return [
        entry.actorName,
        WORKFLOW_KIND_LABELS[entry.kind],
        WORKFLOW_ACTION_LABELS[entry.action],
        entry.comment,
        String(entry.entityId),
      ]
        .join(" ")
        .includes(normalized);
    });
  }, [entries, query, domainTab]);

  return (
    <PageShell className="gap-4">
      <PageHeader
        title="활동로그"
        description="가맹 접수 이관, 설치/AS 완료 등 승인 워크플로우 처리 이력을 조회합니다."
      />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          label="활동로그 검색"
          hideLabel
          placeholder="담당자, 업무, 코멘트 검색"
          className="max-w-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          {DOMAIN_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setDomainTab(tab)}
              className={[
                "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                domainTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {tab === "all" ? "전체" : WORKFLOW_DOMAIN_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground py-10 text-center text-sm">
          불러오는 중...
        </p>
      ) : filteredEntries.length === 0 ? (
        <div className="border-border text-muted-foreground flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-16 text-center text-sm">
          <HistoryIcon className="size-6" />
          조건에 맞는 활동 이력이 없습니다.
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {filteredEntries.map((entry) => (
            <li
              key={entry.id}
              className="border-border bg-card rounded-lg border px-3 py-2.5 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-foreground font-semibold">
                  {entry.actorName}
                  {entry.actorPosition
                    ? ` · ${positionLabel(entry.actorPosition)}`
                    : ""}
                </span>
                <Badge tone="primary" size="sm">
                  {WORKFLOW_ACTION_LABELS[entry.action]}
                </Badge>
                <Badge size="sm">{WORKFLOW_DOMAIN_LABELS[entry.domain]}</Badge>
                <span className="text-muted-foreground text-xs">
                  {WORKFLOW_KIND_LABELS[entry.kind]} · #{entry.entityId}
                </span>
              </div>
              {entry.comment && (
                <p className="text-muted-foreground mt-1 text-xs">
                  {entry.comment}
                </p>
              )}
              <p className="text-muted-foreground mt-1 text-xs">
                {entry.createdAt.slice(0, 16).replace("T", " ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
