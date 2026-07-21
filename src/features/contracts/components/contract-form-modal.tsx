"use client";

import { useId, useState } from "react";
import { XIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ContractFormValue {
  merchantName: string;
  ownerName: string;
  phone: string;
  fileName: string;
}

interface ContractFormModalProps {
  onClose: () => void;
  onSubmit: (value: ContractFormValue) => void;
}

export function ContractFormModal({
  onClose,
  onSubmit,
}: ContractFormModalProps) {
  const titleId = useId();
  const [merchantName, setMerchantName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [fileName, setFileName] = useState("");

  const canSubmit = merchantName.trim() && ownerName.trim() && phone.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      merchantName: merchantName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      fileName: fileName.trim() || `${merchantName.trim()}_가맹계약서.pdf`,
    });
  };

  return (
    <Dialog open onClose={onClose} labelledBy={titleId} className="w-[420px]">
      <div className="border-border flex items-center justify-between border-b px-6 py-5">
        <div id={titleId} className="text-foreground text-lg font-bold">
          계약서 등록
        </div>
        <Button variant="ghost" size="icon" aria-label="닫기" onClick={onClose}>
          <XIcon className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-4 px-6 py-5">
        <Input
          label="상호명"
          value={merchantName}
          onChange={(e) => setMerchantName(e.target.value)}
        />
        <Input
          label="대표자명"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
        />
        <Input
          label="연락처"
          placeholder="010-0000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Input
          label="파일명"
          placeholder="예: 카페아모르_가맹계약서.pdf"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
      </div>

      <div className="border-border flex justify-end gap-2 border-t px-6 py-4">
        <Button onClick={onClose}>취소</Button>
        <Button variant="primary" disabled={!canSubmit} onClick={handleSubmit}>
          등록
        </Button>
      </div>
    </Dialog>
  );
}
