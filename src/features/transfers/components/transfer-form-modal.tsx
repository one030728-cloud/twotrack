"use client";

import { useId, useState } from "react";
import { XIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { INSTALL_TECH_OPTIONS } from "@/features/installations/types";
import {
  TRANSFER_STATUS_META,
  TRANSFER_STATUS_ORDER,
  TRANSFER_TYPE_OPTIONS,
  type TransferRecord,
  type TransferStatus,
  type TransferType,
} from "@/features/transfers/types";

const STATUS_OPTIONS = TRANSFER_STATUS_ORDER.map((status) => ({
  value: status,
  label: TRANSFER_STATUS_META[status].label,
}));

const TYPE_OPTIONS = TRANSFER_TYPE_OPTIONS.map((type) => ({
  value: type,
  label: type,
}));

const ASSIGNED_TECH_OPTIONS = [
  { value: "미배정", label: "미배정" },
  ...INSTALL_TECH_OPTIONS.filter((option) => option.value !== "미배정"),
];

export interface TransferFormValue {
  name: string;
  owner: string;
  phone: string;
  transferType: TransferType;
  status: TransferStatus;
  scheduledDate: string | null;
  assignedTech: string | null;
  address: string;
  memo: string;
}

interface TransferFormModalProps {
  title: string;
  submitLabel: string;
  initial?: TransferRecord;
  onClose: () => void;
  onSubmit: (value: TransferFormValue) => void;
}

export function TransferFormModal({
  title,
  submitLabel,
  initial,
  onClose,
  onSubmit,
}: TransferFormModalProps) {
  const titleId = useId();
  const [name, setName] = useState(initial?.name ?? "");
  const [owner, setOwner] = useState(initial?.owner ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [transferType, setTransferType] = useState<TransferType>(
    initial?.transferType ?? "명의변경",
  );
  const [status, setStatus] = useState<TransferStatus>(
    initial?.status ?? "receipt",
  );
  const [scheduledDate, setScheduledDate] = useState(
    initial?.scheduledDate ?? "",
  );
  const [assignedTech, setAssignedTech] = useState(
    initial?.assignedTech ?? "미배정",
  );
  const [address, setAddress] = useState(initial?.address ?? "");
  const [memo, setMemo] = useState(initial?.memo ?? "");

  const canSubmit = name.trim() && owner.trim() && phone.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      owner: owner.trim(),
      phone: phone.trim(),
      transferType,
      status,
      scheduledDate: scheduledDate || null,
      assignedTech: assignedTech === "미배정" ? null : assignedTech,
      address: address.trim(),
      memo: memo.trim(),
    });
  };

  return (
    <Dialog open onClose={onClose} labelledBy={titleId} className="w-[480px]">
      <div className="border-border flex items-center justify-between border-b px-6 py-5">
        <div id={titleId} className="text-foreground text-lg font-bold">
          {title}
        </div>
        <Button variant="ghost" size="icon" aria-label="닫기" onClick={onClose}>
          <XIcon className="size-4" />
        </Button>
      </div>

      <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto px-6 py-5">
        <Input
          label="상호명"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="대표자명"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
        />
        <Input
          label="연락처"
          placeholder="010-0000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Select
          label="전환유형"
          value={transferType}
          onValueChange={(value) => setTransferType(value as TransferType)}
          options={TYPE_OPTIONS}
        />
        <Select
          label="상태"
          value={status}
          onValueChange={(value) => setStatus(value as TransferStatus)}
          options={STATUS_OPTIONS}
        />
        <DatePicker
          label="예정일"
          value={scheduledDate}
          onChange={setScheduledDate}
        />
        <Select
          label="담당기사"
          value={assignedTech}
          onValueChange={setAssignedTech}
          options={ASSIGNED_TECH_OPTIONS}
        />
        <Input
          label="주소"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Textarea
          label="메모"
          rows={3}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      <div className="border-border flex justify-end gap-2 border-t px-6 py-4">
        <Button onClick={onClose}>취소</Button>
        <Button variant="primary" disabled={!canSubmit} onClick={handleSubmit}>
          {submitLabel}
        </Button>
      </div>
    </Dialog>
  );
}
