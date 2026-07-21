"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createMerchant,
  deleteMerchant,
  fetchMerchants,
  updateMerchant,
} from "@/features/merchants/api/merchants-api";
import type {
  CreateMerchantInput,
  MerchantRecord,
  UpdateMerchantInput,
} from "@/features/merchants/types";

export function useMerchants() {
  const [merchants, setMerchants] = useState<MerchantRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMerchants().then((data) => {
      if (cancelled) return;
      setMerchants(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addMerchant = useCallback(async (input: CreateMerchantInput) => {
    const created = await createMerchant(input);
    setMerchants((prev) => [created, ...prev]);
    return created;
  }, []);

  const editMerchant = useCallback(
    async (id: string, patch: UpdateMerchantInput) => {
      const updated = await updateMerchant(id, patch);
      setMerchants((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    },
    [],
  );

  const removeMerchant = useCallback(async (id: string) => {
    await deleteMerchant(id);
    setMerchants((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return {
    loading,
    merchants,
    addMerchant,
    editMerchant,
    removeMerchant,
  };
}
