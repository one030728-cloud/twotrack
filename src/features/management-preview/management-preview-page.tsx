"use client";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsUpDownIcon,
  PlusIcon,
} from "lucide-react";
import { BulkPaginationBar } from "@/components/ui/bulk-pagination-bar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CountTabs } from "@/components/ui/count-tabs";
import {
  DateRangePicker,
  type DateRangeValue,
} from "@/components/ui/date-range-picker";
import { FilterPanel } from "@/components/ui/filter-panel";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { TableToolbar } from "@/components/ui/table-toolbar";
import {
  CreateEntryModal,
  DetailDrawer,
  ManagementMemoDrawer,
  renderCell,
} from "@/features/management-preview/management-components";
import { useManagementPreview } from "@/features/management-preview/hooks/use-management-preview";
import type { ManagementKind } from "@/features/management-preview/types";
import { downloadManagementCsv } from "@/features/management-preview/utils";

export function ManagementPreviewPage({ kind }: { kind: ManagementKind }) {
  const {
    config,
    query,
    setQuery,
    activeTab,
    setActiveTab,
    filterValues,
    setFilterValues,
    activeKpi,
    setActiveKpi,
    setCurrentPage,
    pageSize,
    setPageSize,
    resetFilters,
    sortState,
    columnWidths,
    selected,
    createOpen,
    setCreateOpen,
    detailRow,
    setDetailRow,
    memoRow,
    setMemoRow,
    kpiCounts,
    tabCounts,
    filteredRows,
    pagedRows,
    totalPages,
    safePage,
    tableWidth,
    allSelected,
    selectedCount,
    updateColumnWidth,
    handleResizePointerDown,
    handleResizeKeyDown,
    handleSort,
    updateRow,
    toggleRow,
    toggleAll,
    selectAllFiltered,
    addRow,
    saveDetail,
    selectKpi,
  } = useManagementPreview(kind);
  return (
    <PageShell className="gap-4 pb-10">
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <PlusIcon className="size-3.5" />
            {config.createLabel}
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {config.kpis.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={kpiCounts[item.label] ?? 0}
            icon={item.icon}
            tone={item.tone}
            active={activeKpi === item.label}
            onClick={() => selectKpi(item.label)}
          />
        ))}
      </div>
      <FilterPanel
        query={query}
        onQueryChange={(value) => {
          setQuery(value);
          setCurrentPage(1);
        }}
        searchPlaceholder={config.searchPlaceholder}
        onReset={resetFilters}
      >
        {config.filters.map((filter, index) => {
          const handleFilterValueChange = (value: string | DateRangeValue) => {
            setCurrentPage(1);
            setFilterValues((current) =>
              current.map((item, itemIndex) =>
                itemIndex === index ? value : item,
              ),
            );
          };

          if (filter.type === "dateRange") {
            return (
              <div key={filter.key} className="w-72">
                <DateRangePicker
                  className="w-full"
                  label={filter.label}
                  hideLabel
                  value={filterValues[index] as DateRangeValue}
                  onChange={handleFilterValueChange}
                />
              </div>
            );
          }

          return (
            <div key={filter.key} className="w-36">
              <Select
                label={filter.label}
                hideLabel
                value={filterValues[index] as string}
                onValueChange={handleFilterValueChange}
                options={(filter.options ?? []).map((option) => ({
                  value: option,
                  label: option,
                }))}
              />
            </div>
          );
        })}
      </FilterPanel>
      <TableToolbar
        tabs={
          <CountTabs
            items={config.tabs.map((tab) => ({ key: tab, label: tab }))}
            activeKey={activeTab}
            counts={tabCounts}
            ariaLabel={`${config.title} 상태 필터`}
            onChange={(tab) => {
              setActiveKpi(null);
              setActiveTab(tab);
              setCurrentPage(1);
            }}
          />
        }
        totalCount={filteredRows.length}
        onExport={() => downloadManagementCsv(kind, config, filteredRows)}
      />
      <div className="border-border bg-card shadow-card overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table
            data-testid="management-table"
            className="table-fixed border-collapse text-[12.5px]"
            style={{ width: "100%", minWidth: tableWidth }}
          >
            <colgroup>
              <col style={{ width: 40 }} />
              {config.columns.map((column) => (
                <col
                  key={column.key}
                  data-column-key={column.key}
                  style={{ width: columnWidths[column.key] }}
                />
              ))}
            </colgroup>
            <thead>
              <tr className="bg-surface-subtle border-border border-b">
                <th className="w-10 px-3 py-2.5 text-left">
                  <Checkbox
                    aria-label="전체 선택"
                    checked={allSelected}
                    onChange={toggleAll}
                  />
                </th>
                {config.columns.map((column) => {
                  const activeSort = sortState.key === column.key;
                  return (
                    <th
                      key={column.key}
                      data-column-key={column.key}
                      aria-sort={
                        column.sortType
                          ? activeSort
                            ? sortState.direction === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                          : undefined
                      }
                      style={{
                        width: columnWidths[column.key],
                        minWidth: column.minWidth,
                      }}
                      className="text-muted-foreground relative px-2.5 py-2.5 text-left font-semibold whitespace-nowrap"
                    >
                      {column.sortType ? (
                        <button
                          type="button"
                          aria-label={`${column.label} 정렬`}
                          onClick={() => handleSort(column)}
                          className={[
                            "hover:text-foreground flex w-full items-center gap-1.5 text-left",
                            activeSort ? "text-foreground" : "",
                          ].join(" ")}
                        >
                          <span className="truncate">{column.label}</span>
                          {activeSort ? (
                            sortState.direction === "asc" ? (
                              <ChevronUpIcon
                                aria-hidden="true"
                                className="size-3 shrink-0"
                              />
                            ) : (
                              <ChevronDownIcon
                                aria-hidden="true"
                                className="size-3 shrink-0"
                              />
                            )
                          ) : (
                            <ChevronsUpDownIcon
                              aria-hidden="true"
                              className="size-3 shrink-0 opacity-40"
                            />
                          )}
                        </button>
                      ) : (
                        <span className="block truncate">{column.label}</span>
                      )}
                      {column.resizable !== false && (
                        <span
                          role="separator"
                          tabIndex={0}
                          aria-label={`${column.label} 열 너비 조절`}
                          aria-orientation="vertical"
                          aria-valuemin={column.minWidth}
                          aria-valuenow={columnWidths[column.key]}
                          title="드래그 또는 방향키로 열 너비 조절"
                          onPointerDown={(event) =>
                            handleResizePointerDown(event, column)
                          }
                          onKeyDown={(event) =>
                            handleResizeKeyDown(event, column)
                          }
                          onDoubleClick={() =>
                            updateColumnWidth(column, column.initialWidth)
                          }
                          onClick={(event) => event.stopPropagation()}
                          className="hover:bg-primary/15 focus-visible:bg-primary/15 absolute top-0 right-0 z-10 h-full w-2 cursor-col-resize touch-none outline-none"
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 && (
                <tr>
                  <td
                    colSpan={config.columns.length + 1}
                    className="text-muted-foreground h-24 text-center text-sm"
                  >
                    조건에 맞는 항목이 없습니다.
                  </td>
                </tr>
              )}
              {pagedRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setDetailRow(row)}
                  className={[
                    "border-border hover:bg-surface-subtle cursor-pointer border-b last:border-0",
                    selected[row.id] ? "bg-primary-muted" : "",
                  ].join(" ")}
                >
                  <td
                    className="px-3 py-2.5"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Checkbox
                      aria-label={`${row.name} 선택`}
                      checked={!!selected[row.id]}
                      onChange={() => toggleRow(row.id)}
                    />
                  </td>
                  {config.columns.map((column) => (
                    <td
                      key={column.key}
                      className="text-foreground px-2.5 py-2.5 whitespace-nowrap"
                    >
                      {renderCell(kind, config, row, column, updateRow, () =>
                        setMemoRow(row),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-border border-t">
          <BulkPaginationBar
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            selectedCount={selectedCount}
            totalFilteredCount={filteredRows.length}
            onSelectAllFiltered={selectAllFiltered}
            actions={
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled
                  title="다음 단계에서 지원 예정"
                >
                  일괄 상태 변경
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled
                  title="다음 단계에서 지원 예정"
                >
                  일괄 담당자 변경
                </Button>
                <button
                  type="button"
                  disabled
                  title="다음 단계에서 지원 예정"
                  className="border-error/30 bg-error/10 text-error hover:bg-error/20 h-8 rounded-lg border px-3 text-xs font-semibold disabled:pointer-events-none disabled:opacity-50"
                >
                  선택 삭제
                </button>
              </div>
            }
          />
        </div>
      </div>
      {createOpen && (
        <CreateEntryModal
          config={config}
          onClose={() => setCreateOpen(false)}
          onSave={addRow}
        />
      )}
      {detailRow && (
        <DetailDrawer
          config={config}
          row={detailRow}
          onClose={() => setDetailRow(null)}
          onSave={saveDetail}
        />
      )}
      {memoRow && (
        <ManagementMemoDrawer row={memoRow} onClose={() => setMemoRow(null)} />
      )}
    </PageShell>
  );
}
