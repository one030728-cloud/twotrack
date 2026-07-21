"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createInstall,
  deleteInstall,
  fetchInstalls,
  updateInstall,
} from "@/features/installations/api/installations-api";
import type { DateRangeValue } from "@/components/ui/date-range-picker";
import {
  matchesInstallStatusTab,
  statusTabsForKind,
  type CreateInstallInput,
  type InstallKind,
  type InstallRecord,
  type InstallStatusTabKey,
  type SortOrder,
} from "@/features/installations/types";

const EMPTY_DATE_RANGE: DateRangeValue = { from: null, to: null };

export function useInstallations() {
  const [installs, setInstalls] = useState<InstallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKindState] = useState<InstallKind>("install");
  const [statusTab, setStatusTabState] = useState<InstallStatusTabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [techFilter, setTechFilterState] = useState("all");
  const [dateRange, setDateRangeState] =
    useState<DateRangeValue>(EMPTY_DATE_RANGE);
  const [sortOrder, setSortOrderState] = useState<SortOrder>("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const [selected, setSelected] = useState<Record<number, true>>({});

  const resetSelection = useCallback(() => setSelected({}), []);

  useEffect(() => {
    let cancelled = false;

    fetchInstalls().then((data) => {
      if (cancelled) return;
      setInstalls(data);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setKind = useCallback(
    (next: InstallKind) => {
      setKindState(next);
      setStatusTabState("all");
      setCurrentPage(1);
      resetSelection();
    },
    [resetSelection],
  );

  const setStatusTab = useCallback(
    (tab: InstallStatusTabKey) => {
      setStatusTabState(tab);
      setCurrentPage(1);
      resetSelection();
    },
    [resetSelection],
  );

  const setSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
      resetSelection();
    },
    [resetSelection],
  );

  const setTechFilter = useCallback(
    (tech: string) => {
      setTechFilterState(tech);
      setCurrentPage(1);
      resetSelection();
    },
    [resetSelection],
  );

  const setDateRange = useCallback(
    (range: DateRangeValue) => {
      setDateRangeState(range);
      setCurrentPage(1);
      resetSelection();
    },
    [resetSelection],
  );

  const setSortOrder = useCallback(
    (order: SortOrder) => {
      setSortOrderState(order);
      setCurrentPage(1);
      resetSelection();
    },
    [resetSelection],
  );

  const kindScoped = useMemo(
    () => installs.filter((r) => r.kind === kind),
    [installs, kind],
  );

  const statusTabDefs = useMemo(() => statusTabsForKind(kind), [kind]);

  const statusTabCounts = useMemo(() => {
    const counts = {} as Record<InstallStatusTabKey, number>;
    for (const tab of statusTabDefs) {
      counts[tab.key] = kindScoped.filter((r) =>
        matchesInstallStatusTab(r, tab.key),
      ).length;
    }
    return counts;
  }, [kindScoped, statusTabDefs]);

  const filteredInstalls = useMemo(() => {
    const query = searchQuery.trim();
    const filtered = kindScoped.filter((r) => {
      if (!matchesInstallStatusTab(r, statusTab)) return false;
      if (techFilter !== "all" && r.assignedTech !== techFilter) return false;
      if (dateRange.from && r.registeredAt.slice(0, 10) < dateRange.from) {
        return false;
      }
      if (dateRange.to && r.registeredAt.slice(0, 10) > dateRange.to) {
        return false;
      }
      if (!query) return true;
      return [r.customerName, r.phone, r.trackingNo ?? ""].some((field) =>
        field.includes(query),
      );
    });
    return [...filtered].sort((a, b) =>
      sortOrder === "latest"
        ? b.registeredAt.localeCompare(a.registeredAt)
        : a.registeredAt.localeCompare(b.registeredAt),
    );
  }, [kindScoped, statusTab, techFilter, dateRange, searchQuery, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredInstalls.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const pagedInstalls = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredInstalls.slice(start, start + pageSize);
  }, [filteredInstalls, safePage]);

  const updateField = useCallback(
    (id: number, patch: Partial<InstallRecord>) => {
      setInstalls((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      );
      updateInstall(id, patch);
    },
    [],
  );

  const addInstall = useCallback(async (input: CreateInstallInput) => {
    const created = await createInstall(input);
    setInstalls((prev) => [created, ...prev]);
    return created;
  }, []);

  const toggleRow = useCallback((id: number) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  }, []);

  // 가맹 접수에서 넘어온 건은 이 화면에서 등록한 게 아니라서 삭제 대상에서 제외한다.
  const selectableInstalls = useMemo(
    () => filteredInstalls.filter((r) => r.source === "manual"),
    [filteredInstalls],
  );

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      const allSelected =
        selectableInstalls.length > 0 &&
        selectableInstalls.every((r) => prev[r.id]);
      const next = { ...prev };
      for (const r of selectableInstalls) {
        if (allSelected) delete next[r.id];
        else next[r.id] = true;
      }
      return next;
    });
  }, [selectableInstalls]);

  const selectedCount = selectableInstalls.filter((r) => selected[r.id]).length;
  const allSelected =
    selectableInstalls.length > 0 &&
    selectableInstalls.every((r) => selected[r.id]);

  const deleteSelected = useCallback(async () => {
    const ids = selectableInstalls
      .filter((r) => selected[r.id])
      .map((r) => r.id);
    if (ids.length === 0) return;
    await Promise.all(ids.map((id) => deleteInstall(id)));
    setInstalls((prev) => prev.filter((r) => !ids.includes(r.id)));
    setSelected((prev) => {
      const next = { ...prev };
      for (const id of ids) delete next[id];
      return next;
    });
  }, [selectableInstalls, selected]);

  return {
    loading,
    installs,
    kind,
    setKind,
    statusTab,
    setStatusTab,
    statusTabDefs,
    statusTabCounts,
    searchQuery,
    setSearchQuery: setSearch,
    techFilter,
    setTechFilter,
    dateRange,
    setDateRange,
    sortOrder,
    setSortOrder,
    filteredInstalls,
    pagedInstalls,
    currentPage: safePage,
    totalPages,
    setPage: setCurrentPage,
    pageSize,
    selected,
    selectedCount,
    allSelected,
    toggleRow,
    toggleSelectAll,
    deleteSelected,
    updateField,
    addInstall,
  };
}
