import type {
  CreateReceiptInput,
  FranchiseReceipt,
  ReceiptKpi,
} from "@/features/franchise-receipts/types";
import type { InstallRecord } from "@/features/installations/types";

export interface TransferReceiptToInstallResult {
  receipt: FranchiseReceipt;
  install: InstallRecord;
}

export async function fetchReceipts(): Promise<FranchiseReceipt[]> {
  const res = await fetch("/api/franchise-receipts");
  return res.json();
}

export async function fetchReceiptKpis(): Promise<ReceiptKpi[]> {
  const res = await fetch("/api/franchise-receipts/kpis");
  return res.json();
}

export async function createReceipt(
  input: CreateReceiptInput,
): Promise<FranchiseReceipt> {
  const res = await fetch("/api/franchise-receipts", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function updateReceipt(
  id: number,
  patch: Partial<FranchiseReceipt>,
): Promise<FranchiseReceipt> {
  const res = await fetch(`/api/franchise-receipts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return res.json();
}

export async function transferReceiptToInstall(
  id: number,
): Promise<TransferReceiptToInstallResult> {
  const res = await fetch(`/api/franchise-receipts/${id}/transfer-install`, {
    method: "POST",
  });
  return res.json();
}
