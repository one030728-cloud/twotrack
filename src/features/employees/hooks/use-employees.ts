"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createEmployee,
  deleteEmployee,
  fetchEmployees,
  updateEmployee,
} from "@/features/employees/api/employees-api";
import type { AuthUser } from "@/features/auth/permissions";
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "@/features/employees/types";

export function useEmployees() {
  const [employees, setEmployees] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchEmployees().then((data) => {
      if (cancelled) return;
      setEmployees(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addEmployee = useCallback(async (input: CreateEmployeeInput) => {
    const created = await createEmployee(input);
    setEmployees((prev) => [...prev, created]);
    return created;
  }, []);

  const editEmployee = useCallback(
    async (id: string, patch: UpdateEmployeeInput) => {
      const updated = await updateEmployee(id, patch);
      setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)));
      return updated;
    },
    [],
  );

  const removeEmployee = useCallback(async (id: string) => {
    await deleteEmployee(id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return {
    loading,
    employees,
    addEmployee,
    editEmployee,
    removeEmployee,
  };
}
