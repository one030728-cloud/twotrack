"use client";

import { useState } from "react";
import { MemoDrawer, type MemoItem } from "@/components/ui/memo-drawer";
import type { InstallRecord } from "@/features/installations/types";

interface InstallMemoDrawerProps {
  record: InstallRecord;
  onClose: () => void;
  onUpdateField: (id: number, patch: Partial<InstallRecord>) => void;
}

export function InstallMemoDrawer({
  record,
  onClose,
  onUpdateField,
}: InstallMemoDrawerProps) {
  const [pinnedIds, setPinnedIds] = useState<Record<string, true>>({});
  const memoItems: MemoItem[] = record.memo
    .split("\n")
    .map((content) => content.trim())
    .filter(Boolean)
    .map((content, index) => ({
      id: `memo-${record.id}-${index}`,
      type: "메모",
      meta: `${record.registeredAt.slice(0, 10).replaceAll("-", ".")} · ${record.registeredBy}`,
      content,
      pinned: !!pinnedIds[`memo-${record.id}-${index}`],
    }));
  const historyItems: MemoItem[] = record.notiHistory.map((entry) => {
    const [meta, ...content] = entry.label.split(" · ");
    return {
      id: entry.id,
      type: "변경 이력",
      meta,
      content: content.join(" · ") || entry.label,
    };
  });

  return (
    <MemoDrawer
      subject={record.customerName}
      description={record.phone}
      items={[...memoItems, ...historyItems]}
      onClose={onClose}
      onAdd={(content) =>
        onUpdateField(record.id, {
          memo: record.memo ? `${record.memo}\n${content}` : content,
        })
      }
      onTogglePin={(id) =>
        setPinnedIds((current) => {
          const next = { ...current };
          if (next[id]) delete next[id];
          else next[id] = true;
          return next;
        })
      }
      onRemove={(id) => {
        const nextMemo = memoItems
          .filter((item) => item.id !== id)
          .map((item) => item.content)
          .join("\n");
        onUpdateField(record.id, { memo: nextMemo });
      }}
    />
  );
}
