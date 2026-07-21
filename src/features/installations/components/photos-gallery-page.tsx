"use client";

import { useMemo, useState } from "react";
import { ImageIcon } from "lucide-react";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { Input } from "@/components/ui/input";
import { useInstallations } from "@/features/installations/hooks/use-installations";
import { InstallDetailDrawer } from "@/features/installations/components/install-detail-drawer";
import type { InstallRecord } from "@/features/installations/types";

interface PhotoEntry {
  installId: number;
  customerName: string;
  fileName: string;
  uploadedAt: string;
}

export function PhotosGalleryPage() {
  const { loading, installs, updateField, refreshInstalls } =
    useInstallations();
  const [query, setQuery] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);

  const photos = useMemo<PhotoEntry[]>(() => {
    const entries: PhotoEntry[] = [];
    for (const record of installs) {
      for (const attachment of record.attachments ?? []) {
        if (attachment.type !== "completionPhoto") continue;
        entries.push({
          installId: record.id,
          customerName: record.customerName,
          fileName: attachment.fileName,
          uploadedAt: attachment.uploadedAt,
        });
      }
    }
    return entries.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }, [installs]);

  const filteredPhotos = useMemo(() => {
    const normalized = query.trim();
    if (!normalized) return photos;
    return photos.filter((photo) =>
      [photo.customerName, photo.fileName].join(" ").includes(normalized),
    );
  }, [photos, query]);

  const detailRecord: InstallRecord | null =
    installs.find((r) => r.id === detailId) ?? null;

  return (
    <PageShell className="gap-4">
      <PageHeader
        title="완료사진"
        description="설치·AS 완료 시 등록된 완료사진을 모아 확인합니다."
      />

      <Input
        label="완료사진 검색"
        hideLabel
        placeholder="고객명, 파일명 검색"
        className="max-w-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading ? (
        <p className="text-muted-foreground py-10 text-center text-sm">
          불러오는 중...
        </p>
      ) : filteredPhotos.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-lg border border-dashed px-4 py-16 text-center text-sm">
          조건에 맞는 완료사진이 없습니다.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPhotos.map((photo) => (
            <button
              key={`${photo.installId}-${photo.fileName}`}
              type="button"
              onClick={() => setDetailId(photo.installId)}
              className="border-border bg-card hover:border-primary flex flex-col gap-3 rounded-lg border p-4 text-left transition-colors"
            >
              <div className="bg-surface-subtle text-muted-foreground flex aspect-video items-center justify-center rounded-md">
                <ImageIcon className="size-8" />
              </div>
              <div className="min-w-0">
                <div className="text-foreground truncate text-sm font-bold">
                  {photo.customerName}
                </div>
                <div className="text-muted-foreground mt-0.5 truncate text-xs">
                  {photo.fileName}
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {photo.uploadedAt.slice(0, 16).replace("T", " ")}
                </div>
              </div>
            </button>
          ))}
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
