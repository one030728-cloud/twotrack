"use client";

import { useMemo, useState } from "react";
import { PlusIcon, RefreshCwIcon, SearchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyableText } from "@/components/ui/copyable-text";
import { Input } from "@/components/ui/input";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { useTransfers } from "@/features/transfers/hooks/use-transfers";
import {
  TRANSFER_STATUS_META,
  TRANSFER_STATUS_ORDER,
  type TransferRecord,
  type TransferStatus,
} from "@/features/transfers/types";
import {
  TransferFormModal,
  type TransferFormValue,
} from "@/features/transfers/components/transfer-form-modal";

const STATUS_BADGE_TONE: Record<
  TransferStatus,
  "primary" | "neutral" | "error"
> = {
  receipt: "error",
  processing: "primary",
  done: "neutral",
};

type StatusTab = "all" | TransferStatus;

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border bg-card rounded-lg border px-4 py-3">
      <div className="text-muted-foreground text-xs font-medium">{label}</div>
      <div className="text-foreground mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function TransferListItem({
  transfer,
  active,
  onSelect,
}: {
  transfer: TransferRecord;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "border-border hover:bg-surface-subtle flex w-full items-start justify-between gap-3 border-b px-4 py-3 text-left last:border-b-0",
        active ? "bg-primary-muted" : "bg-card",
      ].join(" ")}
    >
      <div className="min-w-0">
        <div className="text-foreground truncate text-sm font-bold">
          {transfer.name}
        </div>
        <div className="text-muted-foreground mt-1 truncate text-xs">
          {transfer.transferType} · {transfer.owner} · {transfer.phone}
        </div>
        <div className="text-muted-foreground mt-1 truncate text-xs">
          {transfer.scheduledDate ?? "예정일 미정"}
        </div>
      </div>
      <Badge tone={STATUS_BADGE_TONE[transfer.status]} className="shrink-0">
        {TRANSFER_STATUS_META[transfer.status].label}
      </Badge>
    </button>
  );
}

function TransferDetail({
  transfer,
  onEdit,
  onDelete,
}: {
  transfer: TransferRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="border-border bg-card rounded-lg border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-foreground truncate text-xl font-bold">
            {transfer.name}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {transfer.owner} ·{" "}
            <CopyableText
              value={transfer.phone}
              label="연락처"
              className="hover:text-primary focus-visible:ring-primary/30 rounded-sm underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            />
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {transfer.address || "주소 미등록"}
          </p>
        </div>
        <Badge tone={STATUS_BADGE_TONE[transfer.status]} size="md">
          {TRANSFER_STATUS_META[transfer.status].label}
        </Badge>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground text-xs">전환유형</dt>
          <dd className="text-foreground mt-0.5 font-semibold">
            {transfer.transferType}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">예정일</dt>
          <dd className="text-foreground mt-0.5 font-semibold">
            {transfer.scheduledDate ?? "-"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">담당기사</dt>
          <dd className="text-foreground mt-0.5 font-semibold">
            {transfer.assignedTech ?? "미배정"}
          </dd>
        </div>
      </dl>

      {transfer.memo && (
        <p className="bg-surface-subtle text-foreground mt-4 rounded-lg px-3 py-2 text-sm">
          {transfer.memo}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onEdit}>
          정보 수정
        </Button>
        <Button variant="danger" onClick={onDelete}>
          삭제
        </Button>
      </div>
    </div>
  );
}

export function TransfersPage() {
  const { loading, transfers, addTransfer, editTransfer, removeTransfer } =
    useTransfers();
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TransferRecord | null>(null);

  const filteredTransfers = useMemo(() => {
    const normalized = query.trim();
    return transfers.filter((transfer) => {
      if (statusTab !== "all" && transfer.status !== statusTab) return false;
      if (!normalized) return true;
      return [transfer.name, transfer.owner, transfer.phone, transfer.address]
        .join(" ")
        .includes(normalized);
    });
  }, [transfers, query, statusTab]);

  const selectedTransfer =
    filteredTransfers.find((t) => t.id === selectedId) ??
    filteredTransfers[0] ??
    null;

  const handleAdd = async (value: TransferFormValue) => {
    const created = await addTransfer(value);
    setSelectedId(created.id);
    setAddOpen(false);
  };

  const handleEdit = async (value: TransferFormValue) => {
    if (!editTarget) return;
    await editTransfer(editTarget.id, value);
    setEditTarget(null);
  };

  const handleDelete = (transfer: TransferRecord) => {
    if (!window.confirm(`${transfer.name} 전환건을 삭제하시겠습니까?`)) return;
    removeTransfer(transfer.id);
    if (selectedId === transfer.id) setSelectedId(null);
  };

  return (
    <PageShell className="gap-4 pb-10">
      <PageHeader
        title="전환건"
        description="명의변경·이전설치·폐업철거 등 전환 케이스를 관리합니다."
        actions={
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <PlusIcon className="size-3.5" />
            전환건 등록
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <StatTile label="전체 전환건" value={transfers.length} />
        <StatTile
          label="접수"
          value={transfers.filter((t) => t.status === "receipt").length}
        />
        <StatTile
          label="처리중"
          value={transfers.filter((t) => t.status === "processing").length}
        />
      </div>

      <div className="grid min-h-0 gap-5 xl:grid-cols-[420px_1fr]">
        <aside className="min-w-0">
          <div className="border-border bg-card overflow-hidden rounded-lg border">
            <div className="border-border border-b p-3">
              <div className="relative">
                <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  label="전환건 검색"
                  hideLabel
                  placeholder="상호명, 대표자, 전화번호 검색"
                  className="pl-9"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(["all", ...TRANSFER_STATUS_ORDER] as StatusTab[]).map(
                  (tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setStatusTab(tab)}
                      className={[
                        "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                        statusTab === tab
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground",
                      ].join(" ")}
                    >
                      {tab === "all" ? "전체" : TRANSFER_STATUS_META[tab].label}
                    </button>
                  ),
                )}
              </div>
            </div>
            <div className="max-h-[560px] overflow-y-auto">
              {loading ? (
                <div className="text-muted-foreground px-4 py-10 text-center text-sm">
                  불러오는 중입니다.
                </div>
              ) : filteredTransfers.length === 0 ? (
                <div className="text-muted-foreground px-4 py-10 text-center text-sm">
                  조건에 맞는 전환건이 없습니다.
                </div>
              ) : (
                filteredTransfers.map((transfer) => (
                  <TransferListItem
                    key={transfer.id}
                    transfer={transfer}
                    active={selectedTransfer?.id === transfer.id}
                    onSelect={() => setSelectedId(transfer.id)}
                  />
                ))
              )}
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          {selectedTransfer ? (
            <TransferDetail
              transfer={selectedTransfer}
              onEdit={() => setEditTarget(selectedTransfer)}
              onDelete={() => handleDelete(selectedTransfer)}
            />
          ) : (
            <div className="border-border text-muted-foreground flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-16 text-center text-sm">
              <RefreshCwIcon className="size-6" />
              {loading ? "불러오는 중입니다." : "표시할 전환건이 없습니다."}
            </div>
          )}
        </main>
      </div>

      {addOpen && (
        <TransferFormModal
          title="전환건 등록"
          submitLabel="등록"
          onClose={() => setAddOpen(false)}
          onSubmit={handleAdd}
        />
      )}

      {editTarget && (
        <TransferFormModal
          title={`${editTarget.name} 정보 수정`}
          submitLabel="저장"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEdit}
        />
      )}
    </PageShell>
  );
}
