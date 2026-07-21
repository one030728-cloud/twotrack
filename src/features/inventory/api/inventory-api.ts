import type {
  CreateInventoryItemInput,
  InventoryItemRecord,
  RecordInventoryCountInput,
} from "@/features/inventory/types";

export async function fetchInventoryItems(): Promise<InventoryItemRecord[]> {
  const res = await fetch("/api/inventory");
  return res.json();
}

export async function createInventoryItem(
  input: CreateInventoryItemInput,
): Promise<InventoryItemRecord> {
  const res = await fetch("/api/inventory", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function recordInventoryCount(
  id: string,
  input: RecordInventoryCountInput,
): Promise<InventoryItemRecord> {
  const res = await fetch(`/api/inventory/${id}/count`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await fetch(`/api/inventory/${id}`, { method: "DELETE" });
}
