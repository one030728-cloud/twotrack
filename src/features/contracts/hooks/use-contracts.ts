"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createContract,
  deleteContract,
  fetchContracts,
  updateContract,
} from "@/features/contracts/api/contracts-api";
import type {
  ContractRecord,
  CreateContractInput,
} from "@/features/contracts/types";

export function useContracts() {
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchContracts().then((data) => {
      if (cancelled) return;
      setContracts(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addContract = useCallback(async (input: CreateContractInput) => {
    const created = await createContract(input);
    setContracts((prev) => [created, ...prev]);
    return created;
  }, []);

  const removeContract = useCallback(async (id: string) => {
    await deleteContract(id);
    setContracts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  /** 서명 요청 발송: 초안 상태의 계약서를 서명대기로 전환한다. */
  const requestSignature = useCallback(async (id: string) => {
    const updated = await updateContract(id, {
      status: "pending",
      sentAt: new Date().toISOString(),
    });
    setContracts((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  /** 서명완료 처리: 서명대기 상태를 서명완료로 확정한다. */
  const markSigned = useCallback(async (id: string) => {
    const updated = await updateContract(id, {
      status: "signed",
      signedAt: new Date().toISOString(),
    });
    setContracts((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  return {
    loading,
    contracts,
    addContract,
    removeContract,
    requestSignature,
    markSigned,
  };
}
