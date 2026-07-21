"use client";

import { useMemo, useState } from "react";
import { PlusIcon, SearchIcon, StoreIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyableText } from "@/components/ui/copyable-text";
import { Input } from "@/components/ui/input";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { useMerchants } from "@/features/merchants/hooks/use-merchants";
import {
  MERCHANT_STATUS_META,
  MERCHANT_STATUS_ORDER,
  type MerchantRecord,
  type MerchantStatus,
} from "@/features/merchants/types";
import {
  MerchantFormModal,
  type MerchantFormValue,
} from "@/features/merchants/components/merchant-form-modal";

const STATUS_BADGE_TONE: Record<
  MerchantStatus,
  "primary" | "neutral" | "error"
> = {
  consulting: "primary",
  contracted: "neutral",
  terminated: "error",
};

type StatusTab = "all" | MerchantStatus;

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border bg-card rounded-lg border px-4 py-3">
      <div className="text-muted-foreground text-xs font-medium">{label}</div>
      <div className="text-foreground mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function MerchantListItem({
  merchant,
  active,
  onSelect,
}: {
  merchant: MerchantRecord;
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
          {merchant.name}
        </div>
        <div className="text-muted-foreground mt-1 truncate text-xs">
          {merchant.owner} · {merchant.phone}
        </div>
        <div className="text-muted-foreground mt-1 truncate text-xs">
          {merchant.address || "주소 미등록"}
        </div>
      </div>
      <Badge tone={STATUS_BADGE_TONE[merchant.status]} className="shrink-0">
        {MERCHANT_STATUS_META[merchant.status].label}
      </Badge>
    </button>
  );
}

function MerchantDetail({
  merchant,
  onEdit,
  onDelete,
}: {
  merchant: MerchantRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="border-border bg-card rounded-lg border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-foreground truncate text-xl font-bold">
            {merchant.name}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {merchant.owner} ·{" "}
            <CopyableText
              value={merchant.phone}
              label="연락처"
              className="hover:text-primary focus-visible:ring-primary/30 rounded-sm underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            />{" "}
            · {merchant.businessNo || "사업자번호 미등록"}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {merchant.address || "주소 미등록"}
          </p>
        </div>
        <Badge tone={STATUS_BADGE_TONE[merchant.status]} size="md">
          {MERCHANT_STATUS_META[merchant.status].label}
        </Badge>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground text-xs">담당자</dt>
          <dd className="text-foreground mt-0.5 font-semibold">
            {merchant.manager || "미배정"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">계약일</dt>
          <dd className="text-foreground mt-0.5 font-semibold">
            {merchant.contractDate ?? "-"}
          </dd>
        </div>
      </dl>

      {merchant.memo && (
        <p className="bg-surface-subtle text-foreground mt-4 rounded-lg px-3 py-2 text-sm">
          {merchant.memo}
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

export function MerchantsPage() {
  const { loading, merchants, addMerchant, editMerchant, removeMerchant } =
    useMerchants();
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MerchantRecord | null>(null);

  const filteredMerchants = useMemo(() => {
    const normalized = query.trim();
    return merchants.filter((merchant) => {
      if (statusTab !== "all" && merchant.status !== statusTab) return false;
      if (!normalized) return true;
      return [
        merchant.name,
        merchant.owner,
        merchant.phone,
        merchant.businessNo,
        merchant.address,
      ]
        .join(" ")
        .includes(normalized);
    });
  }, [merchants, query, statusTab]);

  const selectedMerchant =
    filteredMerchants.find((m) => m.id === selectedId) ??
    filteredMerchants[0] ??
    null;

  const handleAdd = async (value: MerchantFormValue) => {
    const created = await addMerchant(value);
    setSelectedId(created.id);
    setAddOpen(false);
  };

  const handleEdit = async (value: MerchantFormValue) => {
    if (!editTarget) return;
    await editMerchant(editTarget.id, value);
    setEditTarget(null);
  };

  const handleDelete = (merchant: MerchantRecord) => {
    if (!window.confirm(`${merchant.name} 가맹점 정보를 삭제하시겠습니까?`)) {
      return;
    }
    removeMerchant(merchant.id);
    if (selectedId === merchant.id) setSelectedId(null);
  };

  return (
    <PageShell className="gap-4 pb-10">
      <PageHeader
        title="가맹점"
        description="가맹점 상담·계약 현황과 기본 정보를 관리합니다."
        actions={
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <PlusIcon className="size-3.5" />
            가맹점 등록
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <StatTile label="전체 가맹점" value={merchants.length} />
        <StatTile
          label="상담중"
          value={merchants.filter((m) => m.status === "consulting").length}
        />
        <StatTile
          label="계약완료"
          value={merchants.filter((m) => m.status === "contracted").length}
        />
      </div>

      <div className="grid min-h-0 gap-5 xl:grid-cols-[420px_1fr]">
        <aside className="min-w-0">
          <div className="border-border bg-card overflow-hidden rounded-lg border">
            <div className="border-border border-b p-3">
              <div className="relative">
                <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  label="가맹점 검색"
                  hideLabel
                  placeholder="상호명, 대표자, 전화번호 검색"
                  className="pl-9"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(["all", ...MERCHANT_STATUS_ORDER] as StatusTab[]).map(
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
                      {tab === "all" ? "전체" : MERCHANT_STATUS_META[tab].label}
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
              ) : filteredMerchants.length === 0 ? (
                <div className="text-muted-foreground px-4 py-10 text-center text-sm">
                  조건에 맞는 가맹점이 없습니다.
                </div>
              ) : (
                filteredMerchants.map((merchant) => (
                  <MerchantListItem
                    key={merchant.id}
                    merchant={merchant}
                    active={selectedMerchant?.id === merchant.id}
                    onSelect={() => setSelectedId(merchant.id)}
                  />
                ))
              )}
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          {selectedMerchant ? (
            <MerchantDetail
              merchant={selectedMerchant}
              onEdit={() => setEditTarget(selectedMerchant)}
              onDelete={() => handleDelete(selectedMerchant)}
            />
          ) : (
            <div className="border-border text-muted-foreground flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-16 text-center text-sm">
              <StoreIcon className="size-6" />
              {loading ? "불러오는 중입니다." : "표시할 가맹점이 없습니다."}
            </div>
          )}
        </main>
      </div>

      {addOpen && (
        <MerchantFormModal
          title="가맹점 등록"
          submitLabel="등록"
          onClose={() => setAddOpen(false)}
          onSubmit={handleAdd}
        />
      )}

      {editTarget && (
        <MerchantFormModal
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
