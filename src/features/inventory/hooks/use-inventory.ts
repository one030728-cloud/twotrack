"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createInventoryItem,
  deleteInventoryItem,
  fetchInventoryItems,
  recordInventoryCount,
} from "@/features/inventory/api/inventory-api";
import type {
  CreateInventoryItemInput,
  InventoryItemRecord,
  RecordInventoryCountInput,
} from "@/features/inventory/types";

export function useInventory() {
  const [items, setItems] = useState<InventoryItemRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchInventoryItems().then((data) => {
      if (cancelled) return;
      setItems(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addItem = useCallback(async (input: CreateInventoryItemInput) => {
    const created = await createInventoryItem(input);
    setItems((prev) => [created, ...prev]);
    return created;
  }, []);

  const recordCount = useCallback(
    async (id: string, input: RecordInventoryCountInput) => {
      const updated = await recordInventoryCount(id, input);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    },
    [],
  );

  const removeItem = useCallback(async (id: string) => {
    await deleteInventoryItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    loading,
    items,
    addItem,
    recordCount,
    removeItem,
  };
}
