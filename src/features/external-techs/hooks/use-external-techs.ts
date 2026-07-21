"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createExternalTech,
  deleteExternalTech,
  fetchExternalTechs,
  updateExternalTech,
} from "@/features/external-techs/api/external-techs-api";
import type {
  CreateExternalTechInput,
  ExternalTechRecord,
  UpdateExternalTechInput,
} from "@/features/external-techs/types";

export function useExternalTechs() {
  const [externalTechs, setExternalTechs] = useState<ExternalTechRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchExternalTechs().then((data) => {
      if (cancelled) return;
      setExternalTechs(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addExternalTech = useCallback(
    async (input: CreateExternalTechInput) => {
      const created = await createExternalTech(input);
      setExternalTechs((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const editExternalTech = useCallback(
    async (id: string, patch: UpdateExternalTechInput) => {
      const updated = await updateExternalTech(id, patch);
      setExternalTechs((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    },
    [],
  );

  const removeExternalTech = useCallback(async (id: string) => {
    await deleteExternalTech(id);
    setExternalTechs((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    loading,
    externalTechs,
    addExternalTech,
    editExternalTech,
    removeExternalTech,
  };
}
