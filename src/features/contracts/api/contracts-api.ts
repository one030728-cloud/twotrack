import type {
  ContractRecord,
  CreateContractInput,
  UpdateContractInput,
} from "@/features/contracts/types";

export async function fetchContracts(): Promise<ContractRecord[]> {
  const res = await fetch("/api/contracts");
  return res.json();
}

export async function createContract(
  input: CreateContractInput,
): Promise<ContractRecord> {
  const res = await fetch("/api/contracts", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function updateContract(
  id: string,
  patch: UpdateContractInput,
): Promise<ContractRecord> {
  const res = await fetch(`/api/contracts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return res.json();
}

export async function deleteContract(id: string): Promise<void> {
  await fetch(`/api/contracts/${id}`, { method: "DELETE" });
}
