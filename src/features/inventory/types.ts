export type InventoryAuditStatus = "pending" | "matched" | "mismatched";

export const INVENTORY_AUDIT_STATUS_META: Record<
  InventoryAuditStatus,
  { label: string }
> = {
  pending: { label: "실사대기" },
  matched: { label: "일치" },
  mismatched: { label: "불일치" },
};

export interface InventoryItemRecord {
  id: string;
  modelName: string;
  location: string;
  expectedQty: number;
  countedQty: number | null;
  status: InventoryAuditStatus;
  countedBy: string | null;
  countedAt: string | null;
  memo: string;
}

export type CreateInventoryItemInput = Pick<
  InventoryItemRecord,
  "modelName" | "location" | "expectedQty"
> &
  Partial<Pick<InventoryItemRecord, "memo">>;

export interface RecordInventoryCountInput {
  countedQty: number;
  countedBy: string;
}
