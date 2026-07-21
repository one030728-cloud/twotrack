"use client";

import {
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { DateRangeValue } from "@/components/ui/date-range-picker";
import { CURRENT_CS_REP } from "@/lib/cs-representatives";
import { configs } from "@/features/management-preview/config";
import type {
  ColumnDef,
  ManagementKind,
  RowData,
  SortState,
} from "@/features/management-preview/types";
import {
  compareRows,
  getDefaultSort,
  getLocalIsoDate,
  matchesKpi,
  matchesTab,
  normalizeDate,
} from "@/features/management-preview/utils";

type FilterValue = string | DateRangeValue;

function getInitialFilterValue(
  filter: (typeof configs)[ManagementKind]["filters"][number],
): FilterValue {
  return filter.type === "dateRange"
    ? { from: null, to: null }
    : (filter.options?.[0] ?? "");
}

function isDateRangeValue(value: FilterValue): value is DateRangeValue {
  return typeof value === "object" && value !== null && "from" in value;
}

export function useManagementPreview(kind: ManagementKind) {
  const config = configs[kind];
  const [rows, setRows] = useState(config.rows);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("전체");
  const [filterValues, setFilterValues] = useState(() =>
    config.filters.map(getInitialFilterValue),
  );
  const [activeKpi, setActiveKpi] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(50);
  const [sortState, setSortState] = useState<SortState>(() =>
    getDefaultSort(kind),
  );
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      config.columns.map((column) => [column.key, column.initialWidth]),
    ),
  );
  const [selected, setSelected] = useState<Record<string, true>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<RowData | null>(null);
  const [memoRow, setMemoRow] = useState<RowData | null>(null);

  const queryAndFilterRows = useMemo(
    () =>
      rows.filter((row) => {
        const normalizedQuery = query.trim().toLowerCase();
        const matchesQuery =
          !normalizedQuery ||
          Object.values(row).some((value) =>
            value.toLowerCase().includes(normalizedQuery),
          );
        const matchesFilters = config.filters.every((filter, index) => {
          const selectedValue = filterValues[index];
          if (filter.type === "dateRange") {
            if (!isDateRangeValue(selectedValue)) return true;
            const rowDate = normalizeDate(row[filter.key]);
            if (selectedValue.from && rowDate < selectedValue.from) {
              return false;
            }
            if (selectedValue.to && rowDate > selectedValue.to) {
              return false;
            }
            return true;
          }
          if (typeof selectedValue !== "string" || !selectedValue) return true;
          return (
            selectedValue === filter.options?.[0] ||
            row[filter.key] === selectedValue
          );
        });
        const matchesActiveKpi = !activeKpi || matchesKpi(kind, row, activeKpi);
        return matchesQuery && matchesFilters && matchesActiveKpi;
      }),
    [activeKpi, config.filters, filterValues, kind, query, rows],
  );

  const kpiCounts = useMemo(
    () =>
      Object.fromEntries(
        config.kpis.map((item) => [
          item.label,
          rows.filter((row) => matchesKpi(kind, row, item.label)).length,
        ]),
      ) as Record<string, number>,
    [config.kpis, kind, rows],
  );

  const tabCounts = useMemo(
    () =>
      Object.fromEntries(
        config.tabs.map((tab) => [
          tab,
          queryAndFilterRows.filter((row) => matchesTab(row, tab, config))
            .length,
        ]),
      ) as Record<string, number>,
    [config, queryAndFilterRows],
  );

  const filteredRows = useMemo(() => {
    const matched = queryAndFilterRows.filter((row) =>
      matchesTab(row, activeTab, config),
    );
    const sortColumn = config.columns.find(
      (column) => column.key === sortState.key,
    );
    if (!sortColumn?.sortType) return matched;
    return [...matched].sort((first, second) =>
      compareRows(first, second, sortColumn, sortState.direction),
    );
  }, [activeTab, config, queryAndFilterRows, sortState]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const tableWidth =
    40 +
    config.columns.reduce(
      (total, column) => total + columnWidths[column.key],
      0,
    );

  const allSelected =
    filteredRows.length > 0 && filteredRows.every((row) => selected[row.id]);
  const selectedCount = filteredRows.filter((row) => selected[row.id]).length;

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setQuery("");
    setFilterValues(config.filters.map(getInitialFilterValue));
    setCurrentPage(1);
  };

  const updateColumnWidth = (column: ColumnDef, width: number) => {
    setColumnWidths((current) => ({
      ...current,
      [column.key]: Math.max(column.minWidth, Math.round(width)),
    }));
  };

  const handleResizePointerDown = (
    event: ReactPointerEvent<HTMLSpanElement>,
    column: ColumnDef,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = columnWidths[column.key];

    const handlePointerMove = (moveEvent: PointerEvent) => {
      updateColumnWidth(column, startWidth + moveEvent.clientX - startX);
    };
    const handlePointerUp = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

  const handleResizeKeyDown = (
    event: ReactKeyboardEvent<HTMLSpanElement>,
    column: ColumnDef,
  ) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    event.stopPropagation();
    const step = event.shiftKey ? 30 : 10;
    const direction = event.key === "ArrowRight" ? 1 : -1;
    updateColumnWidth(column, columnWidths[column.key] + direction * step);
  };

  const handleSort = (column: ColumnDef) => {
    if (!column.sortType) return;
    setSortState((current) => {
      if (current.key === column.key) {
        return {
          key: column.key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      return {
        key: column.key,
        direction:
          column.sortType === "date" || column.sortType === "number"
            ? "desc"
            : "asc",
      };
    });
  };

  const updateRow = (id: string, key: string, value: string) => {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, [key]: value };
        if (kind === "internet" && key === "status") {
          next.openedAt =
            value === "개통완료" && (!row.openedAt || row.openedAt === "-")
              ? getLocalIsoDate()
              : value === "접수완료"
                ? "-"
                : row.openedAt;
        }
        if (
          kind === "internet" &&
          key === "openedAt" &&
          /^\d{4}-\d{2}-\d{2}$/.test(value)
        ) {
          next.status = "개통완료";
        }
        return next;
      }),
    );
  };

  const toggleRow = (id: string) => {
    setSelected((current) => {
      const next = { ...current };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((current) => {
      const next = { ...current };
      for (const row of filteredRows) {
        if (allSelected) delete next[row.id];
        else next[row.id] = true;
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelected((current) => {
      const next = { ...current };
      for (const row of filteredRows) {
        next[row.id] = true;
      }
      return next;
    });
  };

  const addRow = (values: Record<string, string>) => {
    const first = config.rows[0];
    const row = {
      ...Object.fromEntries(Object.keys(first).map((key) => [key, "-"])),
      ...values,
      id: `${kind}-${Date.now()}`,
      registeredBy: first.registeredBy !== undefined ? CURRENT_CS_REP : "-",
      memoCount: values.note ? "1" : "0",
    } as RowData;
    setRows((current) => [row, ...current]);
    setCreateOpen(false);
  };

  const saveDetail = (values: Record<string, string>) => {
    if (!detailRow) return;
    setRows((current) =>
      current.map((row) =>
        row.id === detailRow.id ? { ...row, ...values } : row,
      ),
    );
    setDetailRow(null);
  };

  const selectKpi = (label: string) => {
    setActiveKpi((current) => (current === label ? null : label));
    setActiveTab("전체");
    setQuery("");
    setFilterValues(config.filters.map(getInitialFilterValue));
    setCurrentPage(1);
  };

  return {
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
  };
}
