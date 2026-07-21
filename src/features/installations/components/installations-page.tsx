"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { PageShell } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useInstallations } from "@/features/installations/hooks/use-installations";
import { KindSwitch } from "@/features/installations/components/kind-switch";
import { InstallFilters } from "@/features/installations/components/install-filters";
import { InstallStatusTabs } from "@/features/installations/components/install-status-tabs";
import { InstallTable } from "@/features/installations/components/install-table";
import { InstallDetailDrawer } from "@/features/installations/components/install-detail-drawer";
import { InstallMemoDrawer } from "@/features/installations/components/install-memo-drawer";
import { NewInstallModal } from "@/features/installations/components/new-install-modal";
import { INSTALL_KIND_META } from "@/features/installations/types";

export function InstallationsPage() {
  const {
    loading,
    kind,
    setKind,
    statusTab,
    setStatusTab,
    statusTabDefs,
    statusTabCounts,
    searchQuery,
    setSearchQuery,
    techFilter,
    setTechFilter,
    dateRange,
    setDateRange,
    sortOrder,
    setSortOrder,
    filteredInstalls,
    pagedInstalls,
    currentPage,
    totalPages,
    setPage,
    pageSize,
    selected,
    selectedCount,
    allSelected,
    toggleRow,
    toggleSelectAll,
    deleteSelected,
    updateField,
    addInstall,
  } = useInstallations();

  const [newModalOpen, setNewModalOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [memoId, setMemoId] = useState<number | null>(null);
  const detailRecord =
    filteredInstalls.find((r) => r.id === detailId) ??
    pagedInstalls.find((r) => r.id === detailId) ??
    null;
  const memoRecord =
    filteredInstalls.find((record) => record.id === memoId) ??
    pagedInstalls.find((record) => record.id === memoId) ??
    null;

  const createLabel = `${INSTALL_KIND_META[kind].label} 등록`;

  const handleDeleteSelected = () => {
    if (!window.confirm(`선택한 ${selectedCount}건을 삭제하시겠습니까?`))
      return;
    deleteSelected();
  };

  return (
    <PageShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <KindSwitch kind={kind} onChange={setKind} />
          <p className="text-muted-foreground mt-2 text-sm">
            {INSTALL_KIND_META[kind].description}
          </p>
        </div>
        <Button variant="primary" onClick={() => setNewModalOpen(true)}>
          <PlusIcon className="size-3.5" />
          {createLabel}
        </Button>
      </div>

      <InstallFilters
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        techFilter={techFilter}
        onTechFilterChange={setTechFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      <div className="border-border flex items-center justify-between border-b">
        <InstallStatusTabs
          tabs={statusTabDefs}
          activeTab={statusTab}
          tabCounts={statusTabCounts}
          onChange={setStatusTab}
        />
        <span className="text-foreground pb-2.5 text-sm font-semibold">
          전체 {filteredInstalls.length}건
        </span>
      </div>

      {loading ? (
        <p className="text-muted-foreground py-10 text-center text-sm">
          불러오는 중...
        </p>
      ) : (
        <div className="border-border bg-card overflow-hidden rounded-xl border">
          <InstallTable
            records={filteredInstalls}
            kind={kind}
            selected={selected}
            allSelected={allSelected}
            onToggleRow={toggleRow}
            onToggleSelectAll={toggleSelectAll}
            onUpdateField={updateField}
            onOpenDetail={setDetailId}
            onOpenMemo={setMemoId}
            pageSize={pageSize}
            currentPage={currentPage}
          />
          <div className="border-border border-t">
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              leading={
                selectedCount > 0 ? (
                  <div className="border-border bg-card shadow-card flex flex-wrap items-center gap-3 rounded-lg border px-3.5 py-2">
                    <span className="text-foreground text-sm font-semibold">
                      {selectedCount}건 선택됨
                    </span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleDeleteSelected}
                    >
                      선택 삭제
                    </Button>
                  </div>
                ) : undefined
              }
            />
          </div>
        </div>
      )}

      {newModalOpen && (
        <NewInstallModal
          defaultKind={kind}
          onClose={() => setNewModalOpen(false)}
          onSubmit={addInstall}
        />
      )}

      {detailRecord && (
        <InstallDetailDrawer
          key={detailRecord.id}
          record={detailRecord}
          onClose={() => setDetailId(null)}
          onUpdateField={updateField}
        />
      )}

      {memoRecord && (
        <InstallMemoDrawer
          key={memoRecord.id}
          record={memoRecord}
          onClose={() => setMemoId(null)}
          onUpdateField={updateField}
        />
      )}
    </PageShell>
  );
}
