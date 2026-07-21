"use client";

import { useId, useState } from "react";
import { XIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InventoryItemRecord } from "@/features/inventory/types";

interface InventoryCountModalProps {
  item: InventoryItemRecord;
  defaultCountedBy: string;
  onClose: () => void;
  onSubmit: (input: { countedQty: number; countedBy: string }) => void;
}

export function InventoryCountModal({
  item,
  defaultCountedBy,
  onClose,
  onSubmit,
}: InventoryCountModalProps) {
  const titleId = useId();
  const [countedQty, setCountedQty] = useState(
    String(item.countedQty ?? item.expectedQty),
  );
  const [countedBy, setCountedBy] = useState(defaultCountedBy);

  const canSubmit = countedQty.trim() && countedBy.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      countedQty: Math.max(0, Number(countedQty) || 0),
      countedBy: countedBy.trim(),
    });
  };

  return (
    <Dialog open onClose={onClose} labelledBy={titleId} className="w-[380px]">
      <div className="border-border flex items-center justify-between border-b px-6 py-5">
        <div id={titleId} className="text-foreground text-lg font-bold">
          {item.modelName} 실사 기록
        </div>
        <Button variant="ghost" size="icon" aria-label="닫기" onClick={onClose}>
          <XIcon className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-4 px-6 py-5">
        <p className="text-muted-foreground text-sm">
          장부상 수량 {item.expectedQty}개 · {item.location}
        </p>
        <Input
          label="실사 수량"
          type="number"
          min={0}
          value={countedQty}
          onChange={(e) => setCountedQty(e.target.value)}
        />
        <Input
          label="실사자"
          value={countedBy}
          onChange={(e) => setCountedBy(e.target.value)}
        />
      </div>

      <div className="border-border flex justify-end gap-2 border-t px-6 py-4">
        <Button onClick={onClose}>취소</Button>
        <Button variant="primary" disabled={!canSubmit} onClick={handleSubmit}>
          기록
        </Button>
      </div>
    </Dialog>
  );
}
