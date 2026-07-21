"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createReceipt,
  fetchReceiptKpis,
  fetchReceipts,
  transferReceiptToInstall,
  updateReceipt,
} from "@/features/franchise-receipts/api/franchise-receipts-api";
import type { DateRangeValue } from "@/components/ui/date-range-picker";
import {
  matchesReceiptTab,
  RECEIPT_TABS,
  type BizType,
  type CreateReceiptInput,
  type FranchiseReceipt,
  type ReceiptChannel,
  type ReceiptKpi,
  type ReceiptTabKey,
  type StatusFilterKey,
} from "@/features/franchise-receipts/types";

const EMPTY_DATE_RANGE: DateRangeValue = { from: null, to: null };

export type SortOrder = "latest" | "oldest";

export function useFranchiseReceipts() {
  const [receipts, setReceipts] = useState<FranchiseReceipt[]>([]);
  const [kpis, setKpis] = useState<ReceiptKpi[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTabState] = useState<ReceiptTabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilterState] = useState<
    ReceiptChannel | "all"
  >("all");
  const [bizTypeFilter, setBizTypeFilterState] = useState<BizType | "all">(
    "all",
  );
  const [statusFilter, setStatusFilterState] = useState<StatusFilterKey>("all");
  const [internetFilter, setInternetFilterState] = useState<string>("all");
  const [receiptDateRange, setReceiptDateRangeState] =
    useState<DateRangeValue>(EMPTY_DATE_RANGE);
  const [sortOrder, setSortOrderState] = useState<SortOrder>("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(50);
  const [selected, setSelected] = useState<Record<number, true>>({});

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchReceipts(), fetchReceiptKpis()]).then(([r, k]) => {
      if (cancelled) return;
      setReceipts(r);
      setKpis(k);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setActiveTab = useCallback((tab: ReceiptTabKey) => {
    setActiveTabState(tab);
    setCurrentPage(1);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  const setChannelFilter = useCallback((channel: ReceiptChannel | "all") => {
    setChannelFilterState(channel);
    setCurrentPage(1);
  }, []);

  const setBizTypeFilter = useCallback((bizType: BizType | "all") => {
    setBizTypeFilterState(bizType);
    setCurrentPage(1);
  }, []);

  const setStatusFilter = useCallback((status: StatusFilterKey) => {
    setStatusFilterState(status);
    setCurrentPage(1);
  }, []);

  const setInternetFilter = useCallback((internet: string) => {
    setInternetFilterState(internet);
    setCurrentPage(1);
  }, []);

  const setReceiptDateRange = useCallback((range: DateRangeValue) => {
    setReceiptDateRangeState(range);
    setCurrentPage(1);
  }, []);

  const setSortOrder = useCallback((order: SortOrder) => {
    setSortOrderState(order);
    setCurrentPage(1);
  }, []);

  const filteredReceipts = useMemo(() => {
    const query = searchQuery.trim();
    const filtered = receipts.filter((r) => {
      if (!matchesReceiptTab(r, activeTab)) return false;
      if (channelFilter !== "all" && r.channel !== channelFilter) {
        return false;
      }
      if (bizTypeFilter !== "all" && r.bizType !== bizTypeFilter) {
        return false;
      }
      if (statusFilter === "mine" && !r.isMine) {
        return false;
      }
      if (
        statusFilter !== "all" &&
        statusFilter !== "mine" &&
        r.status !== statusFilter
      ) {
        return false;
      }
      if (internetFilter !== "all" && r.internet !== internetFilter) {
        return false;
      }
      if (receiptDateRange.from && r.receiptDate < receiptDateRange.from) {
        return false;
      }
      if (receiptDateRange.to && r.receiptDate > receiptDateRange.to) {
        return false;
      }
      if (!query) return true;
      return [r.name, r.owner, r.phone, r.bizNo].some((field) =>
        field.includes(query),
      );
    });
    return [...filtered].sort((a, b) =>
      sortOrder === "latest"
        ? b.receiptDate.localeCompare(a.receiptDate)
        : a.receiptDate.localeCompare(b.receiptDate),
    );
  }, [
    receipts,
    activeTab,
    searchQuery,
    channelFilter,
    bizTypeFilter,
    statusFilter,
    internetFilter,
    receiptDateRange,
    sortOrder,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredReceipts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const pagedReceipts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredReceipts.slice(start, start + pageSize);
  }, [filteredReceipts, safePage, pageSize]);

  const tabCounts = useMemo(() => {
    const counts = {} as Record<ReceiptTabKey, number>;
    for (const tab of RECEIPT_TABS) {
      counts[tab.key] = receipts.filter((r) =>
        matchesReceiptTab(r, tab.key),
      ).length;
    }
    return counts;
  }, [receipts]);

  const toggleRow = useCallback((id: number) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      const allSelected =
        filteredReceipts.length > 0 &&
        filteredReceipts.every((r) => prev[r.id]);
      const next = { ...prev };
      for (const r of filteredReceipts) {
        if (allSelected) delete next[r.id];
        else next[r.id] = true;
      }
      return next;
    });
  }, [filteredReceipts]);

  const clearSelection = useCallback(() => setSelected({}), []);

  const selectAllFiltered = useCallback(() => {
    setSelected(() => {
      const next: Record<number, true> = {};
      for (const r of filteredReceipts) next[r.id] = true;
      return next;
    });
  }, [filteredReceipts]);

  const selectedCount = Object.keys(selected).length;
  const allSelected =
    filteredReceipts.length > 0 &&
    filteredReceipts.every((r) => selected[r.id]);

  const updateField = useCallback(
    (id: number, patch: Partial<FranchiseReceipt>) => {
      setReceipts((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      );
      updateReceipt(id, patch);
    },
    [],
  );

  const addReceipt = useCallback(async (input: CreateReceiptInput) => {
    const created = await createReceipt(input);
    setReceipts((prev) => [created, ...prev]);
    return created;
  }, []);

  const transferToInstall = useCallback(async (id: number) => {
    const result = await transferReceiptToInstall(id);
    setReceipts((prev) =>
      prev.map((receipt) =>
        receipt.id === result.receipt.id ? result.receipt : receipt,
      ),
    );
    return result.install;
  }, []);

  return {
    loading,
    kpis,
    receipts,
    filteredReceipts,
    pagedReceipts,
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
    sortOrder,
    setSortOrder,
    currentPage: safePage,
    totalPages,
    setPage: setCurrentPage,
    pageSize,
    setPageSize,
    selected,
    selectedCount,
    allSelected,
    toggleRow,
    toggleSelectAll,
    clearSelection,
    selectAllFiltered,
    updateField,
    addReceipt,
    transferToInstall,
  };
}
