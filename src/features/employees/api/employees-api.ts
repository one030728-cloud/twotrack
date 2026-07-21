import type { AuthUser } from "@/features/auth/permissions";
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "@/features/employees/types";

export async function fetchEmployees(): Promise<AuthUser[]> {
  const res = await fetch("/api/employees");
  return res.json();
}

export async function createEmployee(
  input: CreateEmployeeInput,
): Promise<AuthUser> {
  const res = await fetch("/api/employees", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function updateEmployee(
  id: string,
  patch: UpdateEmployeeInput,
): Promise<AuthUser> {
  const res = await fetch(`/api/employees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return res.json();
}

export async function deleteEmployee(id: string): Promise<void> {
  await fetch(`/api/employees/${id}`, { method: "DELETE" });
}
