import type {
  CreateTransferInput,
  TransferRecord,
  UpdateTransferInput,
} from "@/features/transfers/types";

export async function fetchTransfers(): Promise<TransferRecord[]> {
  const res = await fetch("/api/transfers");
  return res.json();
}

export async function createTransfer(
  input: CreateTransferInput,
): Promise<TransferRecord> {
  const res = await fetch("/api/transfers", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function updateTransfer(
  id: string,
  patch: UpdateTransferInput,
): Promise<TransferRecord> {
  const res = await fetch(`/api/transfers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return res.json();
}

export async function deleteTransfer(id: string): Promise<void> {
  await fetch(`/api/transfers/${id}`, { method: "DELETE" });
}
