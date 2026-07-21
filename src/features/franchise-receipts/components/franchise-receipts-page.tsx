"use client";

import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { useFranchiseReceipts } from "@/features/franchise-receipts/hooks/use-franchise-receipts";
import { ReceiptKpiRow } from "@/features/franchise-receipts/components/receipt-kpi-row";
import { ReceiptFilters } from "@/features/franchise-receipts/components/receipt-filters";
import { ReceiptTabs } from "@/features/franchise-receipts/components/receipt-tabs";
import { ReceiptTable } from "@/features/franchise-receipts/components/receipt-table";
import { ReceiptPaginationBar } from "@/features/franchise-receipts/components/receipt-pagination-bar";
import { ReceiptDetailDrawer } from "@/features/franchise-receipts/components/receipt-detail-drawer";
import { ReceiptMemoDrawer } from "@/features/franchise-receipts/components/receipt-memo-drawer";
import { NewReceiptModal } from "@/features/franchise-receipts/components/new-receipt-modal";
import {
  RECEIPT_STATUS_META,
  UNASSIGNED_LABEL,
  UNSET_LABEL,
  type FranchiseReceipt,
  type ReceiptKpiKey,
} from "@/features/franchise-receipts/types";

const CSV_HEADERS = [
  "접수일",
  "접수채널",
  "사업자유형",
  "상호명",
  "대표자",
  "연락처",
  "등록자",
  "담당자",
  "상태",
];

function toCsvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function downloadReceiptsCsv(receipts: FranchiseReceipt[]) {
  const rows = receipts.map((r) => [
    r.receiptDate,
    r.channel ?? UNSET_LABEL,
    r.bizType ?? UNSET_LABEL,
    r.name,
    r.owner,
    r.phone,
    r.salesRep,
    r.csRep ?? UNASSIGNED_LABEL,
    RECEIPT_STATUS_META[r.status].label,
  ]);
  const csv = [CSV_HEADERS, ...rows]
    .map((row) => row.map(toCsvCell).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `franchise-receipts-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function getLocalIsoDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function matchesReceiptKpi(
  receipt: FranchiseReceipt,
  key: ReceiptKpiKey,
  today: string,
): boolean {
  switch (key) {
    case "today":
      return receipt.receiptDate === today;
    case "docWait":
      return receipt.status === "docWait";
    case "docMissing":
      return receipt.status === "docMissing";
    case "review":
      return receipt.status === "review";
    case "doneToday":
      return receipt.status === "done" && receipt.receiptDate === today;
  }
}

export function FranchiseReceiptsPage() {
  const {
    loading,
    receipts,
    kpis,
    filteredReceipts,
    tabCounts,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    channelFilter,
    setChannelFilter,
    bizTypeFilter,
    setBizTypeFilter,
    statusFilter,
    setStatusFilter,
    internetFilter,
    setInternetFilter,
    receiptDateRange,
    setReceiptDateRange,
    currentPage,
    totalPages,
    setPage,
    pageSize,
    setPageSize,
    selected,
    selectedCount,
    allSelected,
    toggleRow,
    toggleSelectAll,
    selectAllFiltered,
    updateField,
    addReceipt,
    refreshReceipts,
  } = useFranchiseReceipts();

  const [newModalOpen, setNewModalOpen] = useState(false);
  const [detailReceiptId, setDetailReceiptId] = useState<number | null>(null);
  const detailReceipt = receipts.find((r) => r.id === detailReceiptId) ?? null;
  const [memoReceiptId, setMemoReceiptId] = useState<number | null>(null);
  const memoReceipt = receipts.find((r) => r.id === memoReceiptId) ?? null;

  const displayedKpis = useMemo(() => {
    const today = getLocalIsoDate();
    return kpis.map((kpi) => ({
      ...kpi,
      value: receipts.filter((receipt) =>
        matchesReceiptKpi(receipt, kpi.key, today),
      ).length,
    }));
  }, [kpis, receipts]);

  const handleKpiClick = (key: ReceiptKpiKey) => {
    setSearchQuery("");
    setChannelFilter("all");
    setBizTypeFilter("all");
    setInternetFilter("all");

    if (key === "today") {
      const today = getLocalIsoDate();
      setActiveTab("all");
      setStatusFilter("all");
      setReceiptDateRange({ from: today, to: today });
      return;
    }

    setReceiptDateRange({ from: null, to: null });

    if (key === "docWait") {
      setActiveTab("all");
      setStatusFilter("docWait");
      return;
    }

    if (key === "doneToday") {
      const today = getLocalIsoDate();
      setActiveTab("all");
      setStatusFilter("done");
      setReceiptDateRange({ from: today, to: today });
      return;
    }

    setStatusFilter("all");
    setActiveTab(key);
  };

  return (
    <PageShell>
      <PageHeader
        title="가맹 접수 관리"
        description="가맹 접수부터 기술지원 이관과 설치 완료까지 관리합니다."
        actions={
          <Button variant="primary" onClick={() => setNewModalOpen(true)}>
            <PlusIcon className="size-3.5" />
            신규 접수
          </Button>
        }
      />

      <ReceiptKpiRow kpis={displayedKpis} onKpiClick={handleKpiClick} />

      <ReceiptFilters
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        channelFilter={channelFilter}
        onChannelFilterChange={setChannelFilter}
        bizTypeFilter={bizTypeFilter}
        onBizTypeFilterChange={setBizTypeFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        internetFilter={internetFilter}
        onInternetFilterChange={setInternetFilter}
        receiptDateRange={receiptDateRange}
        onReceiptDateRangeChange={setReceiptDateRange}
      />

      <TableToolbar
        tabs={
          <ReceiptTabs
            activeTab={activeTab}
            tabCounts={tabCounts}
            onChange={setActiveTab}
          />
        }
        totalCount={filteredReceipts.length}
        onExport={() => downloadReceiptsCsv(filteredReceipts)}
      />

      {loading ? (
        <p className="text-muted-foreground py-10 text-center text-sm">
          불러오는 중...
        </p>
      ) : (
        <div className="border-border bg-card overflow-hidden rounded-xl border">
          <ReceiptTable
            receipts={filteredReceipts}
            selected={selected}
            allSelected={allSelected}
            onToggleRow={toggleRow}
            onToggleSelectAll={toggleSelectAll}
            onUpdateField={updateField}
            onOpenDetail={setDetailReceiptId}
            onOpenMemo={setMemoReceiptId}
            pageSize={pageSize}
            currentPage={currentPage}
          />
          <ReceiptPaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => setPage(Math.max(1, currentPage - 1))}
            onNext={() => setPage(Math.min(totalPages, currentPage + 1))}
            onGoToPage={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            selectedCount={selectedCount}
            totalFilteredCount={filteredReceipts.length}
            onSelectAllFiltered={selectAllFiltered}
          />
        </div>
      )}

      {newModalOpen && (
        <NewReceiptModal
          onClose={() => setNewModalOpen(false)}
          onSubmit={addReceipt}
        />
      )}

      {detailReceipt && (
        <ReceiptDetailDrawer
          key={detailReceipt.id}
          receipt={detailReceipt}
          onClose={() => setDetailReceiptId(null)}
          onUpdateField={updateField}
          onWorkflowSettled={refreshReceipts}
        />
      )}

      {memoReceipt && (
        <ReceiptMemoDrawer
          key={memoReceipt.id}
          receipt={memoReceipt}
          onClose={() => setMemoReceiptId(null)}
          onUpdateField={updateField}
        />
      )}
    </PageShell>
  );
}
