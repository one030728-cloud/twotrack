"use client";

import { useMemo, useState } from "react";
import { FileEditIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { useInstallations } from "@/features/installations/hooks/use-installations";
import { InstallDetailDrawer } from "@/features/installations/components/install-detail-drawer";
import type { InstallRecord } from "@/features/installations/types";
import { STORE_MOCKS } from "@/features/stores/api/mock-data";
import type { BlueprintEntry } from "@/features/blueprints/types";

const SOURCE_LABEL: Record<BlueprintEntry["source"], string> = {
  install: "설치 관리",
  store: "매장 운영 이력",
};

export function BlueprintsPage() {
  const { loading, installs, updateField, refreshInstalls } =
    useInstallations();
  const [query, setQuery] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);

  const blueprints = useMemo<BlueprintEntry[]>(() => {
    const entries: BlueprintEntry[] = [];
    for (const record of installs) {
      for (const attachment of record.attachments ?? []) {
        if (attachment.type !== "blueprint") continue;
        entries.push({
          id: `install-${attachment.id}`,
          source: "install",
          refId: record.id,
          title: record.customerName,
          fileName: attachment.fileName,
          uploadedAt: attachment.uploadedAt,
        });
      }
    }
    for (const store of STORE_MOCKS) {
      for (const attachment of store.attachments) {
        if (attachment.type !== "blueprint") continue;
        entries.push({
          id: `store-${attachment.id}`,
          source: "store",
          refId: store.id,
          title: store.name,
          fileName: attachment.fileName,
          uploadedAt: attachment.uploadedAt,
        });
      }
    }
    return entries.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }, [installs]);

  const filteredBlueprints = useMemo(() => {
    const normalized = query.trim();
    if (!normalized) return blueprints;
    return blueprints.filter((entry) =>
      [entry.title, entry.fileName].join(" ").includes(normalized),
    );
  }, [blueprints, query]);

  const detailRecord: InstallRecord | null =
    installs.find((r) => r.id === detailId) ?? null;

  return (
    <PageShell className="gap-4">
      <PageHeader
        title="설계도"
        description="설치건과 매장에 등록된 도면 파일을 모아 확인합니다."
      />

      <Input
        label="설계도 검색"
        hideLabel
        placeholder="상호명, 파일명 검색"
        className="max-w-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading ? (
        <p className="text-muted-foreground py-10 text-center text-sm">
          불러오는 중...
        </p>
      ) : filteredBlueprints.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-lg border border-dashed px-4 py-16 text-center text-sm">
          조건에 맞는 설계도가 없습니다.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBlueprints.map((entry) => {
            const isInstall = entry.source === "install";
            return (
              <button
                key={entry.id}
                type="button"
                disabled={!isInstall}
                onClick={() => isInstall && setDetailId(entry.refId as number)}
                className="border-border bg-card hover:border-primary disabled:hover:border-border flex flex-col gap-3 rounded-lg border p-4 text-left transition-colors disabled:cursor-default"
              >
                <div className="bg-surface-subtle text-muted-foreground flex aspect-video items-center justify-center rounded-md">
                  <FileEditIcon className="size-8" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-foreground truncate text-sm font-bold">
                      {entry.title}
                    </div>
                    <Badge size="sm" className="shrink-0">
                      {SOURCE_LABEL[entry.source]}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground mt-0.5 truncate text-xs">
                    {entry.fileName}
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs">
                    {entry.uploadedAt.slice(0, 16).replace("T", " ")}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {detailRecord && (
        <InstallDetailDrawer
          key={detailRecord.id}
          record={detailRecord}
          onClose={() => setDetailId(null)}
          onUpdateField={updateField}
          onWorkflowSettled={refreshInstalls}
        />
      )}
    </PageShell>
  );
}
