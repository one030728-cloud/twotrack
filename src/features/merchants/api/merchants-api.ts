import type {
  CreateMerchantInput,
  MerchantRecord,
  UpdateMerchantInput,
} from "@/features/merchants/types";

export async function fetchMerchants(): Promise<MerchantRecord[]> {
  const res = await fetch("/api/merchants");
  return res.json();
}

export async function createMerchant(
  input: CreateMerchantInput,
): Promise<MerchantRecord> {
  const res = await fetch("/api/merchants", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function updateMerchant(
  id: string,
  patch: UpdateMerchantInput,
): Promise<MerchantRecord> {
  const res = await fetch(`/api/merchants/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return res.json();
}

export async function deleteMerchant(id: string): Promise<void> {
  await fetch(`/api/merchants/${id}`, { method: "DELETE" });
}
