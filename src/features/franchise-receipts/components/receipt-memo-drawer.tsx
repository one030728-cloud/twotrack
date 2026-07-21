"use client";

import { MemoDrawer, type MemoItem } from "@/components/ui/memo-drawer";
import type {
  FranchiseReceipt,
  MemoEntry,
} from "@/features/franchise-receipts/types";
import { UNSET_LABEL } from "@/features/franchise-receipts/types";

function todayMeta(): string {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join(".");
  const time = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join(":");
  return `${date} ${time} · 담당 CS`;
}

interface ReceiptMemoDrawerProps {
  receipt: FranchiseReceipt;
  onClose: () => void;
  onUpdateField: (id: number, patch: Partial<FranchiseReceipt>) => void;
}

function isSystemHistory(entry: MemoEntry): boolean {
  return (
    entry.id.includes("-seed-registered") || entry.id.includes("-seed-status")
  );
}

export function ReceiptMemoDrawer({
  receipt,
  onClose,
  onUpdateField,
}: ReceiptMemoDrawerProps) {
  const items: MemoItem[] = receipt.memoHistory.map((entry) => {
    const systemHistory = isSystemHistory(entry);
    return {
      ...entry,
      type: systemHistory ? "변경 이력" : "메모",
      removable: !systemHistory,
    };
  });

  const addMemo = (content: string) => {
    const entry: MemoEntry = {
      id: crypto.randomUUID(),
      meta: todayMeta(),
      content,
      pinned: false,
    };
    onUpdateField(receipt.id, {
      memo: content,
      memoHistory: [...receipt.memoHistory, entry],
    });
  };

  const togglePin = (id: string) => {
    onUpdateField(receipt.id, {
      memoHistory: receipt.memoHistory.map((entry) =>
        entry.id === id ? { ...entry, pinned: !entry.pinned } : entry,
      ),
    });
  };

  const removeMemo = (id: string) => {
    onUpdateField(receipt.id, {
      memoHistory: receipt.memoHistory.filter((entry) => entry.id !== id),
    });
  };

  return (
    <MemoDrawer
      subject={receipt.name}
      description={`${receipt.owner} · ${receipt.bizType ?? UNSET_LABEL} · ${receipt.phone}`}
      items={items}
      onClose={onClose}
      onAdd={addMemo}
      onTogglePin={togglePin}
      onRemove={removeMemo}
    />
  );
}
