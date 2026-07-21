"use client";

import { useId, useState } from "react";
import { XIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { CS_REPRESENTATIVE_OPTIONS } from "@/lib/cs-representatives";
import {
  MERCHANT_STATUS_META,
  MERCHANT_STATUS_ORDER,
  type MerchantRecord,
  type MerchantStatus,
} from "@/features/merchants/types";

const STATUS_OPTIONS = MERCHANT_STATUS_ORDER.map((status) => ({
  value: status,
  label: MERCHANT_STATUS_META[status].label,
}));

export interface MerchantFormValue {
  name: string;
  owner: string;
  phone: string;
  businessNo: string;
  address: string;
  status: MerchantStatus;
  manager: string;
  contractDate: string | null;
  memo: string;
}

interface MerchantFormModalProps {
  title: string;
  submitLabel: string;
  initial?: MerchantRecord;
  onClose: () => void;
  onSubmit: (value: MerchantFormValue) => void;
}

export function MerchantFormModal({
  title,
  submitLabel,
  initial,
  onClose,
  onSubmit,
}: MerchantFormModalProps) {
  const titleId = useId();
  const [name, setName] = useState(initial?.name ?? "");
  const [owner, setOwner] = useState(initial?.owner ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [businessNo, setBusinessNo] = useState(initial?.businessNo ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [status, setStatus] = useState<MerchantStatus>(
    initial?.status ?? "consulting",
  );
  const [manager, setManager] = useState(
    initial?.manager ?? CS_REPRESENTATIVE_OPTIONS[0]?.value ?? "",
  );
  const [contractDate, setContractDate] = useState(initial?.contractDate ?? "");
  const [memo, setMemo] = useState(initial?.memo ?? "");

  const canSubmit = name.trim() && owner.trim() && phone.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      owner: owner.trim(),
      phone: phone.trim(),
      businessNo: businessNo.trim(),
      address: address.trim(),
      status,
      manager,
      contractDate: contractDate || null,
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
        <Input
          label="사업자번호"
          placeholder="000-00-00000"
          value={businessNo}
          onChange={(e) => setBusinessNo(e.target.value)}
        />
        <Input
          label="주소"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Select
          label="상태"
          value={status}
          onValueChange={(value) => setStatus(value as MerchantStatus)}
          options={STATUS_OPTIONS}
        />
        <Select
          label="담당자"
          value={manager}
          onValueChange={setManager}
          options={[...CS_REPRESENTATIVE_OPTIONS]}
        />
        <DatePicker
          label="계약일"
          value={contractDate}
          onChange={setContractDate}
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
