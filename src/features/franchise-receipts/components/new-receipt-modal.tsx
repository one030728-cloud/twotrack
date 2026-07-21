"use client";

import { useId, useState } from "react";
import { XIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionTitle } from "@/components/ui/section-title";
import { ProductCombobox } from "@/features/franchise-receipts/components/product-combobox";
import {
  formatBusinessNumber,
  formatPhoneNumber,
} from "@/lib/format-identifiers";
import {
  BIZ_TYPES,
  CS_REP_OPTIONS,
  INTERNET_OPTIONS,
  PRODUCT_OPTIONS,
  RECEIPT_CHANNELS,
  UNASSIGNED_LABEL,
  UNSET_LABEL,
  VAN_OPTIONS,
  type BizType,
  type CreateReceiptInput,
  type ReceiptChannel,
} from "@/features/franchise-receipts/types";

const CHANNEL_OPTIONS = RECEIPT_CHANNELS.map((c) => ({ value: c, label: c }));
const BIZ_TYPE_OPTIONS = BIZ_TYPES.map((t) => ({ value: t, label: t }));

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface ProductLine {
  id: string;
  product: string;
  qty: number;
}

interface NewReceiptModalProps {
  onClose: () => void;
  onSubmit: (input: CreateReceiptInput) => void;
}

export function NewReceiptModal({ onClose, onSubmit }: NewReceiptModalProps) {
  const titleId = useId();

  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [phone, setPhone] = useState("");
  const [bizNo, setBizNo] = useState("");
  const [receiptDate, setReceiptDate] = useState(todayIso());
  const [channel, setChannel] = useState<ReceiptChannel | null>(null);
  const [bizType, setBizType] = useState<BizType | null>(null);
  const [internet, setInternet] = useState<string | null>(null);
  const [csRep, setCsRep] = useState<string | null>(null);

  const [productSelect, setProductSelect] = useState(PRODUCT_OPTIONS[0].value);
  const [productQty, setProductQty] = useState(1);
  const [products, setProducts] = useState<ProductLine[]>([]);
  const [vanSelected, setVanSelected] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [openDate, setOpenDate] = useState("");
  const [installDate, setInstallDate] = useState("");
  const [notifyOnRegister, setNotifyOnRegister] = useState(false);

  const addProduct = () => {
    setProducts((prev) => [
      ...prev,
      { id: crypto.randomUUID(), product: productSelect, qty: productQty },
    ]);
  };

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleVan = (van: string) => {
    setVanSelected((prev) =>
      prev.includes(van) ? prev.filter((v) => v !== van) : [...prev, van],
    );
  };

  const canSubmit = name.trim() && owner.trim() && phone.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      owner: owner.trim(),
      phone: phone.trim(),
      bizNo: bizNo.trim() || undefined,
      channel,
      bizType,
      internet,
      receiptDate,
      csRep,
    });
    onClose();
  };

  return (
    <Dialog open onClose={onClose} variant="modal" labelledBy={titleId}>
      <div className="flex max-h-[90vh] flex-col">
        <div className="border-border flex flex-shrink-0 items-center justify-between border-b px-7 py-5">
          <div id={titleId} className="text-foreground text-[19px] font-bold">
            프랜차이즈 정보 입력
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="닫기"
            onClick={onClose}
          >
            <XIcon className="size-4.5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-5">
          <div className="flex flex-col gap-5">
            <div>
              <SectionTitle>기본 정보</SectionTitle>
              <div className="grid grid-cols-4 gap-3.5">
                <Input
                  label="상호명"
                  placeholder="상호명 입력"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="대표자명"
                  placeholder="대표자명 입력"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                />
                <Input
                  label="연락처"
                  placeholder="010-0000-0000"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                />
                <Input
                  label="사업자번호"
                  placeholder="000-00-00000"
                  inputMode="numeric"
                  value={bizNo}
                  onChange={(e) =>
                    setBizNo(formatBusinessNumber(e.target.value))
                  }
                />
              </div>
            </div>

            <div>
              <SectionTitle>접수 정보</SectionTitle>
              <div className="grid grid-cols-4 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground text-xs">
                    접수날짜
                  </span>
                  <DatePicker
                    value={receiptDate}
                    onChange={setReceiptDate}
                    hideLabel
                  />
                </div>
                <Select
                  label="접수채널"
                  value={channel}
                  onValueChange={(value) => setChannel(value as ReceiptChannel)}
                  options={CHANNEL_OPTIONS}
                  placeholder={UNSET_LABEL}
                  disablePortal
                />
                <Select
                  label="사업자 유형"
                  value={bizType}
                  onValueChange={(value) => setBizType(value as BizType)}
                  options={BIZ_TYPE_OPTIONS}
                  placeholder={UNSET_LABEL}
                  disablePortal
                />
                <Select
                  label="인터넷"
                  value={internet}
                  onValueChange={setInternet}
                  options={INTERNET_OPTIONS}
                  placeholder={UNSET_LABEL}
                  disablePortal
                />
                <Select
                  label="담당자"
                  value={csRep}
                  onValueChange={setCsRep}
                  options={CS_REP_OPTIONS}
                  placeholder={UNASSIGNED_LABEL}
                  disablePortal
                />
                <div className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground text-xs">
                    오픈예정일
                  </span>
                  <DatePicker
                    value={openDate}
                    onChange={setOpenDate}
                    hideLabel
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground text-xs">
                    설치 및 발송일
                  </span>
                  <DatePicker
                    value={installDate}
                    onChange={setInstallDate}
                    hideLabel
                  />
                </div>
              </div>
            </div>

            <div>
              <SectionTitle>상품</SectionTitle>
              <div className="grid grid-cols-[1fr_72px_auto] items-end gap-2">
                <ProductCombobox
                  label="상품"
                  value={productSelect}
                  onValueChange={setProductSelect}
                  options={PRODUCT_OPTIONS}
                />
                <Input
                  label="수량"
                  type="number"
                  min={1}
                  max={99}
                  value={productQty}
                  onChange={(e) =>
                    setProductQty(Math.min(99, Number(e.target.value) || 1))
                  }
                  className="text-center"
                />
                <Button variant="secondary" onClick={addProduct}>
                  추가
                </Button>
              </div>
              {products.length > 0 && (
                <div className="mt-2 flex flex-col gap-1.5">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="bg-surface-subtle flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                    >
                      <span>
                        {p.product} × {p.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProduct(p.id)}
                        className="text-error text-xs"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <SectionTitle>주소</SectionTitle>
              <div className="grid grid-cols-[1fr_180px] gap-3.5">
                <Input
                  label="주소"
                  placeholder="주소 입력"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <Input
                  label="상세주소"
                  placeholder="상세주소 입력"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <SectionTitle>VAN사 (중복선택 가능)</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {VAN_OPTIONS.map((van) => {
                  const active = vanSelected.includes(van);
                  return (
                    <button
                      key={van}
                      type="button"
                      onClick={() => toggleVan(van)}
                      className={[
                        "h-8 rounded-full border px-3.5 text-xs font-semibold",
                        active
                          ? "border-primary bg-primary-muted text-primary"
                          : "border-border bg-card text-foreground hover:border-primary/50",
                      ].join(" ")}
                    >
                      {van}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="border-border flex flex-shrink-0 items-center justify-between border-t px-7 py-4">
          <Checkbox
            label="등록 즉시 서류안내 알림톡 발송"
            checked={notifyOnRegister}
            onChange={(e) => setNotifyOnRegister(e.target.checked)}
          />
          <Button
            variant="primary"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            등록
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
