"use client";

import { useId, useState } from "react";
import { XIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface InventoryItemFormValue {
  modelName: string;
  location: string;
  expectedQty: number;
  memo: string;
}

interface InventoryItemModalProps {
  onClose: () => void;
  onSubmit: (value: InventoryItemFormValue) => void;
}

export function InventoryItemModal({
  onClose,
  onSubmit,
}: InventoryItemModalProps) {
  const titleId = useId();
  const [modelName, setModelName] = useState("");
  const [location, setLocation] = useState("");
  const [expectedQty, setExpectedQty] = useState("0");
  const [memo, setMemo] = useState("");

  const canSubmit = modelName.trim() && location.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      modelName: modelName.trim(),
      location: location.trim(),
      expectedQty: Math.max(0, Number(expectedQty) || 0),
      memo: memo.trim(),
    });
  };

  return (
    <Dialog open onClose={onClose} labelledBy={titleId} className="w-[420px]">
      <div className="border-border flex items-center justify-between border-b px-6 py-5">
        <div id={titleId} className="text-foreground text-lg font-bold">
          실사 품목 추가
        </div>
        <Button variant="ghost" size="icon" aria-label="닫기" onClick={onClose}>
          <XIcon className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-4 px-6 py-5">
        <Input
          label="품목명"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
        />
        <Input
          label="보관 위치"
          placeholder="예: 본사 재고, 박기사 보유"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Input
          label="장부상 수량"
          type="number"
          min={0}
          value={expectedQty}
          onChange={(e) => setExpectedQty(e.target.value)}
        />
        <Textarea
          label="메모"
          rows={2}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      <div className="border-border flex justify-end gap-2 border-t px-6 py-4">
        <Button onClick={onClose}>취소</Button>
        <Button variant="primary" disabled={!canSubmit} onClick={handleSubmit}>
          추가
        </Button>
      </div>
    </Dialog>
  );
}
