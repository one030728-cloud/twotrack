"use client";

import { useId, useState } from "react";
import { XIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  EXTERNAL_TECH_STATUS_META,
  EXTERNAL_TECH_STATUS_ORDER,
  type ExternalTechRecord,
  type ExternalTechStatus,
} from "@/features/external-techs/types";

const STATUS_OPTIONS = EXTERNAL_TECH_STATUS_ORDER.map((status) => ({
  value: status,
  label: EXTERNAL_TECH_STATUS_META[status].label,
}));

export interface ExternalTechFormValue {
  name: string;
  phone: string;
  company: string;
  region: string;
  specialty: string;
  status: ExternalTechStatus;
  contractedAt: string | null;
  memo: string;
}

interface ExternalTechFormModalProps {
  title: string;
  submitLabel: string;
  initial?: ExternalTechRecord;
  onClose: () => void;
  onSubmit: (value: ExternalTechFormValue) => void;
}

export function ExternalTechFormModal({
  title,
  submitLabel,
  initial,
  onClose,
  onSubmit,
}: ExternalTechFormModalProps) {
  const titleId = useId();
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [specialty, setSpecialty] = useState(initial?.specialty ?? "");
  const [status, setStatus] = useState<ExternalTechStatus>(
    initial?.status ?? "active",
  );
  const [contractedAt, setContractedAt] = useState(initial?.contractedAt ?? "");
  const [memo, setMemo] = useState(initial?.memo ?? "");

  const canSubmit = name.trim() && phone.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      company: company.trim(),
      region: region.trim(),
      specialty: specialty.trim(),
      status,
      contractedAt: contractedAt || null,
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
          label="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="연락처"
          placeholder="010-0000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Input
          label="소속업체"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <Input
          label="활동지역"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        />
        <Input
          label="전문분야"
          placeholder="예: 설치, AS, 인터넷"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        />
        <Select
          label="상태"
          value={status}
          onValueChange={(value) => setStatus(value as ExternalTechStatus)}
          options={STATUS_OPTIONS}
        />
        <DatePicker
          label="계약일"
          value={contractedAt}
          onChange={setContractedAt}
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
