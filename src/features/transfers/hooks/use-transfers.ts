"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createTransfer,
  deleteTransfer,
  fetchTransfers,
  updateTransfer,
} from "@/features/transfers/api/transfers-api";
import type {
  CreateTransferInput,
  TransferRecord,
  UpdateTransferInput,
} from "@/features/transfers/types";

export function useTransfers() {
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchTransfers().then((data) => {
      if (cancelled) return;
      setTransfers(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addTransfer = useCallback(async (input: CreateTransferInput) => {
    const created = await createTransfer(input);
    setTransfers((prev) => [created, ...prev]);
    return created;
  }, []);

  const editTransfer = useCallback(
    async (id: string, patch: UpdateTransferInput) => {
      const updated = await updateTransfer(id, patch);
      setTransfers((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    },
    [],
  );

  const removeTransfer = useCallback(async (id: string) => {
    await deleteTransfer(id);
    setTransfers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    loading,
    transfers,
    addTransfer,
    editTransfer,
    removeTransfer,
  };
}
