"use client";

import { useMemo, useState } from "react";
import { FileTextIcon, PlusIcon, SearchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyableText } from "@/components/ui/copyable-text";
import { Input } from "@/components/ui/input";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { useContracts } from "@/features/contracts/hooks/use-contracts";
import {
  CONTRACT_STATUS_META,
  CONTRACT_STATUS_ORDER,
  type ContractRecord,
  type ContractStatus,
} from "@/features/contracts/types";
import {
  ContractFormModal,
  type ContractFormValue,
} from "@/features/contracts/components/contract-form-modal";

const STATUS_BADGE_TONE: Record<
  ContractStatus,
  "primary" | "neutral" | "error"
> = {
  draft: "neutral",
  pending: "error",
  signed: "primary",
};

type StatusTab = "all" | ContractStatus;

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border bg-card rounded-lg border px-4 py-3">
      <div className="text-muted-foreground text-xs font-medium">{label}</div>
      <div className="text-foreground mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function ContractListItem({
  contract,
  active,
  onSelect,
}: {
  contract: ContractRecord;
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
          {contract.merchantName}
        </div>
        <div className="text-muted-foreground mt-1 truncate text-xs">
          {contract.ownerName} · {contract.phone}
        </div>
        <div className="text-muted-foreground mt-1 truncate text-xs">
          {contract.fileName}
        </div>
      </div>
      <Badge tone={STATUS_BADGE_TONE[contract.status]} className="shrink-0">
        {CONTRACT_STATUS_META[contract.status].label}
      </Badge>
    </button>
  );
}

function copyToClipboard(text: string) {
  navigator.clipboard?.writeText(text);
}

function ContractDetail({
  contract,
  onRequestSignature,
  onMarkSigned,
  onDelete,
}: {
  contract: ContractRecord;
  onRequestSignature: () => void;
  onMarkSigned: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="border-border bg-card rounded-lg border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-foreground truncate text-xl font-bold">
            {contract.merchantName}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {contract.ownerName} ·{" "}
            <CopyableText
              value={contract.phone}
              label="연락처"
              className="hover:text-primary focus-visible:ring-primary/30 rounded-sm underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            />
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {contract.fileName}
          </p>
        </div>
        <Badge tone={STATUS_BADGE_TONE[contract.status]} size="md">
          {CONTRACT_STATUS_META[contract.status].label}
        </Badge>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground text-xs">서명 요청일</dt>
          <dd className="text-foreground mt-0.5 font-semibold">
            {contract.sentAt?.slice(0, 16).replace("T", " ") ?? "-"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">서명 완료일</dt>
          <dd className="text-foreground mt-0.5 font-semibold">
            {contract.signedAt?.slice(0, 16).replace("T", " ") ?? "-"}
          </dd>
        </div>
      </dl>

      {contract.memo && (
        <p className="bg-surface-subtle text-foreground mt-4 rounded-lg px-3 py-2 text-sm">
          {contract.memo}
        </p>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button
          variant="secondary"
          onClick={() =>
            copyToClipboard(`https://posmos.example.com/sign/${contract.id}`)
          }
        >
          서명 링크 복사
        </Button>
        {contract.status === "draft" && (
          <Button variant="primary" onClick={onRequestSignature}>
            서명 요청 발송
          </Button>
        )}
        {contract.status === "pending" && (
          <Button variant="primary" onClick={onMarkSigned}>
            서명완료 처리
          </Button>
        )}
        <Button variant="danger" onClick={onDelete}>
          삭제
        </Button>
      </div>
    </div>
  );
}

export function ContractsPage() {
  const {
    loading,
    contracts,
    addContract,
    removeContract,
    requestSignature,
    markSigned,
  } = useContracts();
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filteredContracts = useMemo(() => {
    const normalized = query.trim();
    return contracts.filter((contract) => {
      if (statusTab !== "all" && contract.status !== statusTab) return false;
      if (!normalized) return true;
      return [contract.merchantName, contract.ownerName, contract.phone]
        .join(" ")
        .includes(normalized);
    });
  }, [contracts, query, statusTab]);

  const selectedContract =
    filteredContracts.find((c) => c.id === selectedId) ??
    filteredContracts[0] ??
    null;

  const handleAdd = async (value: ContractFormValue) => {
    const created = await addContract(value);
    setSelectedId(created.id);
    setAddOpen(false);
  };

  const handleDelete = (contract: ContractRecord) => {
    if (
      !window.confirm(`${contract.merchantName} 계약서를 삭제하시겠습니까?`)
    ) {
      return;
    }
    removeContract(contract.id);
    if (selectedId === contract.id) setSelectedId(null);
  };

  return (
    <PageShell className="gap-4 pb-10">
      <PageHeader
        title="계약서/서명"
        description="가맹 계약서 발송과 서명 진행 현황을 관리합니다."
        actions={
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <PlusIcon className="size-3.5" />
            계약서 등록
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <StatTile label="전체 계약서" value={contracts.length} />
        <StatTile
          label="서명대기"
          value={contracts.filter((c) => c.status === "pending").length}
        />
        <StatTile
          label="서명완료"
          value={contracts.filter((c) => c.status === "signed").length}
        />
      </div>

      <div className="grid min-h-0 gap-5 xl:grid-cols-[420px_1fr]">
        <aside className="min-w-0">
          <div className="border-border bg-card overflow-hidden rounded-lg border">
            <div className="border-border border-b p-3">
              <div className="relative">
                <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  label="계약서 검색"
                  hideLabel
                  placeholder="상호명, 대표자, 전화번호 검색"
                  className="pl-9"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(["all", ...CONTRACT_STATUS_ORDER] as StatusTab[]).map(
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
                      {tab === "all" ? "전체" : CONTRACT_STATUS_META[tab].label}
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
              ) : filteredContracts.length === 0 ? (
                <div className="text-muted-foreground px-4 py-10 text-center text-sm">
                  조건에 맞는 계약서가 없습니다.
                </div>
              ) : (
                filteredContracts.map((contract) => (
                  <ContractListItem
                    key={contract.id}
                    contract={contract}
                    active={selectedContract?.id === contract.id}
                    onSelect={() => setSelectedId(contract.id)}
                  />
                ))
              )}
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          {selectedContract ? (
            <ContractDetail
              contract={selectedContract}
              onRequestSignature={() => requestSignature(selectedContract.id)}
              onMarkSigned={() => markSigned(selectedContract.id)}
              onDelete={() => handleDelete(selectedContract)}
            />
          ) : (
            <div className="border-border text-muted-foreground flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-16 text-center text-sm">
              <FileTextIcon className="size-6" />
              {loading ? "불러오는 중입니다." : "표시할 계약서가 없습니다."}
            </div>
          )}
        </main>
      </div>

      {addOpen && (
        <ContractFormModal
          onClose={() => setAddOpen(false)}
          onSubmit={handleAdd}
        />
      )}
    </PageShell>
  );
}
