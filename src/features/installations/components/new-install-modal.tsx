"use client";

import { useId, useState } from "react";
import { XIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import {
  INSTALL_KIND_META,
  INSTALL_KIND_ORDER,
  INSTALL_TECH_OPTIONS,
  PRODUCT_OPTIONS,
  TIME_SLOT_OPTIONS,
  type CreateInstallInput,
  type InstallKind,
} from "@/features/installations/types";

interface NewInstallModalProps {
  defaultKind: InstallKind;
  onClose: () => void;
  onSubmit: (input: CreateInstallInput) => void;
}

export function NewInstallModal({
  defaultKind,
  onClose,
  onSubmit,
}: NewInstallModalProps) {
  const titleId = useId();

  const [kind, setKind] = useState<InstallKind>(defaultKind);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [product, setProduct] = useState(PRODUCT_OPTIONS[0].value);
  const [assignedTech, setAssignedTech] = useState("미배정");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOT_OPTIONS[0].value);
  const [trackingNo, setTrackingNo] = useState("");
  const [symptom, setSymptom] = useState("");

  const showSchedule = kind === "install" || kind === "as";
  const showTracking = kind === "parcel";
  const showSymptom = kind === "as";

  const canSubmit = customerName.trim() && phone.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      kind,
      customerName: customerName.trim(),
      phone: phone.trim(),
      product,
      assignedTech: assignedTech === "미배정" ? null : assignedTech,
      address: address.trim(),
      addressDetail: addressDetail.trim(),
      scheduledDate: showSchedule && scheduledDate ? scheduledDate : null,
      timeSlot: showSchedule && scheduledDate ? timeSlot : null,
      trackingNo: showTracking && trackingNo ? trackingNo.trim() : null,
      symptom: showSymptom ? symptom.trim() : "",
    });
    onClose();
  };

  return (
    <Dialog open onClose={onClose} variant="modal" labelledBy={titleId}>
      <div className="flex max-h-[90vh] flex-col">
        <div className="border-border flex flex-shrink-0 items-center justify-between border-b px-7 py-5">
          <div id={titleId} className="text-foreground text-[19px] font-bold">
            설치관리 신규 등록
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
              <div className="text-foreground mb-2.5 text-[13px] font-bold">
                구분
              </div>
              <div className="flex gap-2">
                {INSTALL_KIND_ORDER.map((k) => {
                  const active = k === kind;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKind(k)}
                      className={[
                        "h-9 rounded-lg border px-4 text-sm font-semibold",
                        active
                          ? "border-primary bg-primary-muted text-primary"
                          : "border-border bg-card text-foreground hover:border-primary/50",
                      ].join(" ")}
                    >
                      {INSTALL_KIND_META[k].label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-foreground mb-2.5 text-[13px] font-bold">
                기본 정보
              </div>
              <div className="grid grid-cols-4 gap-3.5">
                <Input
                  label="고객명"
                  placeholder="고객명 입력"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <Input
                  label="전화번호"
                  placeholder="010-0000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Select
                  label="제품"
                  value={product}
                  onValueChange={setProduct}
                  options={PRODUCT_OPTIONS}
                />
                <Select
                  label="담당기사"
                  value={assignedTech}
                  onValueChange={setAssignedTech}
                  options={INSTALL_TECH_OPTIONS}
                />
              </div>
            </div>

            <div>
              <div className="text-foreground mb-2.5 text-[13px] font-bold">
                {kind === "parcel" ? "배송지" : "주소"}
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <Input
                  label="주소"
                  hideLabel
                  placeholder="주소 입력"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <Input
                  label="상세주소"
                  hideLabel
                  placeholder="상세주소 입력"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                />
              </div>
            </div>

            {showSchedule && (
              <div>
                <div className="text-foreground mb-2.5 text-[13px] font-bold">
                  설치 예정일
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <DatePicker
                    label="설치 예정일"
                    hideLabel
                    value={scheduledDate}
                    onChange={setScheduledDate}
                  />
                  <Select
                    label="희망 시간대"
                    value={timeSlot}
                    onValueChange={setTimeSlot}
                    options={TIME_SLOT_OPTIONS}
                  />
                </div>
              </div>
            )}

            {showTracking && (
              <Input
                label="송장번호"
                placeholder="택배사 송장번호 입력 (발급 전이면 비워두기)"
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
              />
            )}

            {showSymptom && (
              <Textarea
                label="증상 · 접수 내용"
                placeholder="접수된 증상이나 요청 내용을 입력하세요"
                rows={3}
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="border-border flex flex-shrink-0 items-center justify-end border-t px-7 py-4">
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
