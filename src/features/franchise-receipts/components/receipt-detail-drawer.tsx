"use client";

import { useId, useState } from "react";
import { XIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyableText } from "@/components/ui/copyable-text";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { SectionTitle } from "@/components/ui/section-title";
import { ProductCombobox } from "@/features/franchise-receipts/components/product-combobox";
import {
  formatBusinessNumber,
  formatPhoneNumber,
} from "@/lib/format-identifiers";
import { StageProgress } from "@/features/franchise-receipts/components/stage-progress";
import { STATUS_COLORS } from "@/features/franchise-receipts/status-colors";
import {
  BIZ_TYPES,
  CS_REP_OPTIONS,
  INTERNET_OPTIONS,
  PRODUCT_OPTIONS,
  RECEIPT_CHANNELS,
  RECEIPT_STATUS_META,
  UNASSIGNED_LABEL,
  UNSET_LABEL,
  VAN_OPTIONS,
  type BizType,
  type FranchiseReceipt,
  type ReceiptChannel,
} from "@/features/franchise-receipts/types";
import { ApprovalWorkflowPanel } from "@/features/workflow/components/approval-workflow-panel";
import { useApprovalWorkflow } from "@/features/workflow/hooks/use-approval-workflow";

const CHANNEL_OPTIONS = RECEIPT_CHANNELS.map((c) => ({ value: c, label: c }));
const BIZ_TYPE_OPTIONS = BIZ_TYPES.map((t) => ({ value: t, label: t }));

interface ProductLine {
  id: string;
  product: string;
  qty: number;
}

function copyToClipboard(text: string) {
  navigator.clipboard?.writeText(text);
}

interface ReceiptDetailDrawerProps {
  receipt: FranchiseReceipt;
  onClose: () => void;
  onUpdateField: (id: number, patch: Partial<FranchiseReceipt>) => void;
  onWorkflowSettled: () => void;
}

export function ReceiptDetailDrawer({
  receipt,
  onClose,
  onUpdateField,
  onWorkflowSettled,
}: ReceiptDetailDrawerProps) {
  const titleId = useId();

  const [productSelect, setProductSelect] = useState(PRODUCT_OPTIONS[0].value);
  const [productQty, setProductQty] = useState(1);
  const [products, setProducts] = useState<ProductLine[]>([]);
  const [vanSelected, setVanSelected] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [openDate, setOpenDate] = useState("");
  const [installDate, setInstallDate] = useState("");
  const {
    workflow,
    loading: workflowLoading,
    canRequest,
    canApproveResponsible,
    canApproveTeamLead,
    canReject,
    canRequestInfo,
    canProvideInfo,
    request,
    approve,
    conditionalApprove,
    reject,
    requestInfo,
    provideInfo,
  } = useApprovalWorkflow("franchise_transfer", receipt.id);

  const handleApprove = async (comment?: string) => {
    const updated = await approve(comment);
    if (updated?.stage === "team_lead_approved") onWorkflowSettled();
  };

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

  const colors = STATUS_COLORS[receipt.status];

  return (
    <Dialog
      open
      onClose={onClose}
      variant="drawer"
      labelledBy={titleId}
      className="flex w-[640px] max-w-[calc(100vw-32px)] flex-col"
    >
      <div className="border-border flex-shrink-0 border-b px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <div id={titleId} className="text-foreground text-lg font-bold">
              {receipt.name}
            </div>
            <div className="text-muted-foreground mt-1 text-[13.5px]">
              {receipt.owner} · {receipt.bizType ?? UNSET_LABEL} ·{" "}
              <CopyableText
                value={receipt.phone}
                label="연락처"
                className="hover:text-primary focus-visible:ring-primary/30 rounded-sm underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="닫기"
            onClick={onClose}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
          <span
            className={[
              "inline-flex h-8 items-center rounded-md px-3 text-xs font-semibold",
              colors.pill,
            ].join(" ")}
          >
            {RECEIPT_STATUS_META[receipt.status].label}
          </span>
          <span className="border-border bg-surface-subtle text-muted-foreground inline-flex h-8 items-center rounded-md border px-3 text-xs font-semibold">
            접수일 {receipt.receiptDate}
          </span>
        </div>
        <div className="mt-4">
          <StageProgress stage={receipt.stage} status={receipt.status} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="flex flex-col gap-5">
          <div>
            <SectionTitle>기본 정보</SectionTitle>
            <div className="grid grid-cols-2 gap-3.5">
              <Input
                label="상호명"
                value={receipt.name}
                onChange={(e) =>
                  onUpdateField(receipt.id, { name: e.target.value })
                }
              />
              <Input
                label="대표자명"
                value={receipt.owner}
                onChange={(e) =>
                  onUpdateField(receipt.id, { owner: e.target.value })
                }
              />
              <Input
                label="연락처"
                inputMode="tel"
                value={receipt.phone}
                onChange={(e) =>
                  onUpdateField(receipt.id, {
                    phone: formatPhoneNumber(e.target.value),
                  })
                }
              />
              <Input
                label="사업자번호"
                placeholder="000-00-00000"
                inputMode="numeric"
                value={receipt.bizNo}
                onChange={(e) =>
                  onUpdateField(receipt.id, {
                    bizNo: formatBusinessNumber(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div>
            <SectionTitle>접수 정보</SectionTitle>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <span className="text-muted-foreground text-xs">접수날짜</span>
                <DatePicker
                  value={receipt.receiptDate}
                  onChange={(value) =>
                    onUpdateField(receipt.id, { receiptDate: value })
                  }
                  hideLabel
                />
              </div>
              <Select
                label="접수채널"
                value={receipt.channel}
                onValueChange={(value) =>
                  onUpdateField(receipt.id, {
                    channel: value as ReceiptChannel,
                  })
                }
                options={CHANNEL_OPTIONS}
                placeholder={UNSET_LABEL}
                disablePortal
              />
              <Select
                label="사업자 유형"
                value={receipt.bizType}
                onValueChange={(value) =>
                  onUpdateField(receipt.id, { bizType: value as BizType })
                }
                options={BIZ_TYPE_OPTIONS}
                placeholder={UNSET_LABEL}
                disablePortal
              />
              <Select
                label="인터넷"
                value={receipt.internet}
                onValueChange={(value) =>
                  onUpdateField(receipt.id, { internet: value })
                }
                options={INTERNET_OPTIONS}
                placeholder={UNSET_LABEL}
                disablePortal
              />
              <Select
                label="담당자"
                value={receipt.csRep}
                onValueChange={(value) =>
                  onUpdateField(receipt.id, {
                    csRep: value,
                  })
                }
                options={CS_REP_OPTIONS}
                placeholder={UNASSIGNED_LABEL}
                disablePortal
              />
              <div className="flex flex-col gap-1.5">
                <span className="text-muted-foreground text-xs">등록자</span>
                <div className="border-border bg-muted text-muted-foreground flex h-9 items-center rounded-lg border px-3 text-sm">
                  {receipt.salesRep}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-muted-foreground text-xs">
                  오픈예정일
                </span>
                <DatePicker value={openDate} onChange={setOpenDate} hideLabel />
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

          <div>
            <SectionTitle>기술지원 이관 승인</SectionTitle>
            <ApprovalWorkflowPanel
              workflow={workflow}
              loading={workflowLoading}
              canRequest={canRequest}
              canApproveResponsible={canApproveResponsible}
              canApproveTeamLead={canApproveTeamLead}
              canReject={canReject}
              canRequestInfo={canRequestInfo}
              canProvideInfo={canProvideInfo}
              requestLabel="이관 요청"
              onRequest={() => request()}
              onApprove={handleApprove}
              onConditionalApprove={conditionalApprove}
              onReject={reject}
              onRequestInfo={requestInfo}
              onProvideInfo={provideInfo}
            />
          </div>
        </div>
      </div>

      <div className="border-border bg-card flex flex-shrink-0 flex-wrap items-center gap-2 border-t px-6 py-3.5">
        <Button
          variant="ghost"
          onClick={() =>
            copyToClipboard(
              `${typeof window !== "undefined" ? window.location.origin : ""}/franchise-receipts?id=${receipt.id}`,
            )
          }
        >
          링크 복사
        </Button>
        <Button
          variant="secondary"
          disabled
          title="다음 단계에서 지원 예정"
          className="bg-surface-subtle"
        >
          서류안내 재발송
        </Button>
        <Button
          variant="primary"
          disabled
          title="다음 단계에서 지원 예정"
          className="shadow-sm"
        >
          인터넷 등록
        </Button>
      </div>
    </Dialog>
  );
}
