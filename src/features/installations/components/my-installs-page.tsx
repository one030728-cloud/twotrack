"use client";

import { useEffect, useState } from "react";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useAuth } from "@/features/auth/auth-provider";
import { useInstallations } from "@/features/installations/hooks/use-installations";
import { KindSwitch } from "@/features/installations/components/kind-switch";
import { InstallFilters } from "@/features/installations/components/install-filters";
import { InstallStatusTabs } from "@/features/installations/components/install-status-tabs";
import { InstallTable } from "@/features/installations/components/install-table";
import { InstallDetailDrawer } from "@/features/installations/components/install-detail-drawer";
import { InstallMemoDrawer } from "@/features/installations/components/install-memo-drawer";
import {
  INSTALL_KIND_META,
  techNameForUserName,
} from "@/features/installations/types";

export function MyInstallsPage() {
  const { user } = useAuth();
  const myTechName = user ? techNameForUserName(user.name) : null;

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
    allSelected,
    toggleRow,
    toggleSelectAll,
    updateField,
    refreshInstalls,
  } = useInstallations();

  useEffect(() => {
    if (myTechName) setTechFilter(myTechName);
  }, [myTechName, setTechFilter]);

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

  if (!myTechName) {
    return (
      <PageShell>
        <PageHeader
          title="기사 페이지"
          description="내가 담당한 설치·택배·AS 건을 확인하고 처리합니다."
        />
        <p className="text-muted-foreground py-10 text-center text-sm">
          담당기사로 등록된 계정에서만 사용할 수 있습니다.
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="기사 페이지"
        description={`${myTechName} 님이 담당한 건만 표시합니다.`}
      />

      <KindSwitch kind={kind} onChange={setKind} />
      <p className="text-muted-foreground -mt-2 text-sm">
        {INSTALL_KIND_META[kind].description}
      </p>

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
            />
          </div>
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
