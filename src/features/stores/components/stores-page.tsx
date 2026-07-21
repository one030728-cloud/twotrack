"use client";

import { useMemo, useState } from "react";
import {
  FileImageIcon,
  FileTextIcon,
  HistoryIcon,
  PackageCheckIcon,
  SearchIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CopyableText } from "@/components/ui/copyable-text";
import { Input } from "@/components/ui/input";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import {
  DEVICE_STATUS_META,
  type WorkOrderAttachment,
  type WorkOrderDeviceResultAction,
} from "@/features/installations/types";
import { STORE_MOCKS } from "@/features/stores/api/mock-data";
import {
  STORE_STATUS_META,
  type StoreRecord,
  type StoreStatus,
} from "@/features/stores/types";

const STATUS_BADGE_CLASS: Record<StoreStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  opening: "bg-primary-muted text-primary",
  paused: "bg-muted text-muted-foreground",
};

const ATTACHMENT_TYPE_LABEL: Record<WorkOrderAttachment["type"], string> = {
  blueprint: "도면",
  completionPhoto: "완료사진",
  sitePhoto: "현장사진",
  document: "서류",
};

const DEVICE_ACTION_LABEL: Record<WorkOrderDeviceResultAction, string> = {
  installed: "설치",
  removed: "회수",
  shipped: "발송",
  returned: "반납",
};

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border bg-card rounded-lg border px-4 py-3">
      <div className="text-muted-foreground text-xs font-medium">{label}</div>
      <div className="text-foreground mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function StoreListItem({
  store,
  active,
  onSelect,
}: {
  store: StoreRecord;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={[
        "border-border hover:bg-surface-subtle flex w-full items-start justify-between gap-3 border-b px-4 py-3 text-left last:border-b-0",
        active ? "bg-primary-muted" : "bg-card",
      ].join(" ")}
    >
      <div className="min-w-0">
        <button
          type="button"
          onClick={onSelect}
          className="text-foreground hover:text-primary block w-full truncate text-left text-sm font-bold"
        >
          {store.name}
        </button>
        <div className="text-muted-foreground mt-1 truncate text-xs">
          {store.owner} ·{" "}
          <CopyableText
            value={store.phone}
            label="연락처"
            className="hover:text-primary focus-visible:ring-primary/30 rounded-sm underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={onSelect}
          className="text-muted-foreground hover:text-primary mt-1 block w-full truncate text-left text-xs"
        >
          {store.address}
        </button>
      </div>
      <span
        className={[
          "shrink-0 rounded-md px-2 py-1 text-xs font-semibold",
          STATUS_BADGE_CLASS[store.status],
        ].join(" ")}
      >
        {STORE_STATUS_META[store.status].label}
      </span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border-border text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
      {message}
    </div>
  );
}

function StoreDetail({ store }: { store: StoreRecord }) {
  return (
    <div className="flex flex-col gap-5">
      <section className="border-border bg-card rounded-lg border p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-foreground truncate text-xl font-bold">
              {store.name}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {store.owner} ·{" "}
              <CopyableText
                value={store.phone}
                label="연락처"
                className="hover:text-primary focus-visible:ring-primary/30 rounded-sm underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
              />{" "}
              · {store.businessNo}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {store.address}
            </p>
          </div>
          <span
            className={[
              "rounded-md px-2.5 py-1 text-xs font-semibold",
              STATUS_BADGE_CLASS[store.status],
            ].join(" ")}
          >
            {STORE_STATUS_META[store.status].label}
          </span>
        </div>
        {store.memo && (
          <p className="bg-surface-subtle text-foreground mt-4 rounded-lg px-3 py-2 text-sm">
            {store.memo}
          </p>
        )}
      </section>

      <section>
        <div className="mb-2.5 flex items-center gap-2">
          <PackageCheckIcon className="text-primary size-4" />
          <h3 className="text-foreground text-sm font-bold">현재 설치 기기</h3>
        </div>
        {store.devices.length === 0 ? (
          <EmptyState message="현재 설치된 기기가 없습니다." />
        ) : (
          <div className="grid gap-2 lg:grid-cols-2">
            {store.devices.map((device) => (
              <div
                key={device.id}
                className="border-border bg-card rounded-lg border px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-foreground truncate text-sm font-bold">
                      {device.modelName}
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      {device.serialNo} · {device.installedAt} 설치
                    </div>
                  </div>
                  <Badge className="shrink-0">
                    {DEVICE_STATUS_META[device.status].label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-2.5 flex items-center gap-2">
          <HistoryIcon className="text-primary size-4" />
          <h3 className="text-foreground text-sm font-bold">최근 작업 이력</h3>
        </div>
        <div className="border-border bg-card overflow-hidden rounded-lg border">
          {store.workHistory.map((work) => (
            <div
              key={work.id}
              className="border-border grid gap-3 border-b px-4 py-3 last:border-b-0 md:grid-cols-[150px_1fr]"
            >
              <div>
                <div className="text-foreground text-sm font-bold">
                  {work.workedAt}
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {work.typeLabel} · {work.statusLabel}
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {work.assignedTech ?? "미배정"}
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-foreground text-sm">{work.resultMemo}</p>
                {work.devices.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {work.devices.map((device) => (
                      <Badge key={`${work.id}-${device.serialNo}`}>
                        {DEVICE_ACTION_LABEL[device.action]} · {device.serialNo}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2.5 flex items-center gap-2">
          <FileImageIcon className="text-primary size-4" />
          <h3 className="text-foreground text-sm font-bold">도면 / 완료사진</h3>
        </div>
        {store.attachments.length === 0 ? (
          <EmptyState message="연결된 도면이나 사진이 없습니다." />
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {store.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="border-border bg-card flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <FileTextIcon className="text-muted-foreground size-4 shrink-0" />
                  <span className="text-foreground truncate text-sm font-semibold">
                    {attachment.fileName}
                  </span>
                </div>
                <Badge className="shrink-0">
                  {ATTACHMENT_TYPE_LABEL[attachment.type]}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function StoresPage() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(STORE_MOCKS[0]?.id ?? "");
  const filteredStores = useMemo(() => {
    const normalized = query.trim();
    if (!normalized) return STORE_MOCKS;
    return STORE_MOCKS.filter((store) =>
      [
        store.name,
        store.owner,
        store.phone,
        store.businessNo,
        store.address,
        STORE_STATUS_META[store.status].label,
      ]
        .join(" ")
        .includes(normalized),
    );
  }, [query]);
  const selectedStore =
    filteredStores.find((store) => store.id === selectedId) ??
    filteredStores[0] ??
    STORE_MOCKS[0];

  return (
    <PageShell className="gap-4 pb-10">
      <PageHeader
        title="매장 운영 이력"
        description="설치 완료 이후 매장별 현재 기기, 작업 이력, 도면과 사진을 확인합니다."
      />

      <div className="grid gap-3 md:grid-cols-3">
        <StatTile label="전체 매장" value={STORE_MOCKS.length} />
        <StatTile
          label="현재 설치 기기"
          value={STORE_MOCKS.reduce(
            (total, store) => total + store.devices.length,
            0,
          )}
        />
        <StatTile
          label="최근 작업 이력"
          value={STORE_MOCKS.reduce(
            (total, store) => total + store.workHistory.length,
            0,
          )}
        />
      </div>

      <div className="grid min-h-0 gap-5 xl:grid-cols-[420px_1fr]">
        <aside className="min-w-0">
          <div className="border-border bg-card overflow-hidden rounded-lg border">
            <div className="border-border border-b p-3">
              <div className="relative">
                <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  label="매장 검색"
                  hideLabel
                  placeholder="매장명, 대표자, 전화번호 검색"
                  className="pl-9"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
            <div className="max-h-[620px] overflow-y-auto">
              {filteredStores.length === 0 ? (
                <div className="text-muted-foreground px-4 py-10 text-center text-sm">
                  조건에 맞는 매장이 없습니다.
                </div>
              ) : (
                filteredStores.map((store) => (
                  <StoreListItem
                    key={store.id}
                    store={store}
                    active={selectedStore.id === store.id}
                    onSelect={() => setSelectedId(store.id)}
                  />
                ))
              )}
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          {selectedStore ? (
            <StoreDetail store={selectedStore} />
          ) : (
            <EmptyState message="표시할 매장이 없습니다." />
          )}
        </main>
      </div>
    </PageShell>
  );
}
