"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  PaperclipIcon,
  PlusIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyableText } from "@/components/ui/copyable-text";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { INSTALL_STATUS_COLORS } from "@/features/installations/status-colors";
import {
  DEVICE_STATUS_META,
  INSTALL_KIND_META,
  INSTALL_TECH_OPTIONS,
  MOCK_DEVICE_OPTIONS,
  PRODUCT_OPTIONS,
  TIME_SLOT_OPTIONS,
  statusOptionsForKind,
  type InstallRecord,
  type InstallStatus,
  type PendingCompletion,
  type WorkOrderAttachment,
  type WorkOrderDevicePlan,
  type WorkOrderDeviceResult,
} from "@/features/installations/types";
import { ApprovalWorkflowPanel } from "@/features/workflow/components/approval-workflow-panel";
import { useApprovalWorkflow } from "@/features/workflow/hooks/use-approval-workflow";

interface InstallDetailDrawerProps {
  record: InstallRecord;
  onClose: () => void;
  onUpdateField: (id: number, patch: Partial<InstallRecord>) => void;
  onWorkflowSettled: () => void;
}

const SOURCE_LABEL: Record<InstallRecord["source"], string> = {
  franchise: "가맹접수 연동",
  manual: "직접 등록",
};

const ATTACHMENT_TYPE_LABEL: Record<WorkOrderAttachment["type"], string> = {
  blueprint: "도면",
  completionPhoto: "완료사진",
  sitePhoto: "현장사진",
  document: "서류",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-foreground mb-2.5 text-[13px] font-bold">
        {title}
      </div>
      {children}
    </div>
  );
}

function createAttachment(
  type: WorkOrderAttachment["type"],
  fileName: string,
): WorkOrderAttachment {
  return {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    fileName,
    uploadedAt: new Date().toISOString(),
  };
}

export function InstallDetailDrawer({
  record,
  onClose,
  onUpdateField,
  onWorkflowSettled,
}: InstallDetailDrawerProps) {
  const titleId = useId();
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
  } = useApprovalWorkflow("install_completion", record.id);

  const handleApprove = async (comment?: string) => {
    const updated = await approve(comment);
    if (updated?.stage === "team_lead_approved") onWorkflowSettled();
  };
  const colors = INSTALL_STATUS_COLORS[record.status];
  const showSchedule = record.kind === "install" || record.kind === "as";
  const showTracking = record.kind === "parcel";
  const showSymptom = record.kind === "as";
  const [deviceQuery, setDeviceQuery] = useState("");
  const [blueprintName, setBlueprintName] = useState("");
  const [completionOpen, setCompletionOpen] = useState(false);
  const plannedDevices = record.plannedDevices ?? [];
  const attachments = record.attachments ?? [];
  const deviceResults = record.deviceResults ?? [];
  const storeWorkHistory = record.storeWorkHistory ?? [];
  const filteredDeviceOptions = useMemo(() => {
    const query = deviceQuery.trim().toLowerCase();
    if (!query) return MOCK_DEVICE_OPTIONS;
    return MOCK_DEVICE_OPTIONS.filter((device) =>
      [
        device.modelName,
        device.serialNo ?? "",
        DEVICE_STATUS_META[device.status].label,
        device.currentLocation,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [deviceQuery]);

  const addPlannedDevice = (device: WorkOrderDevicePlan) => {
    if (plannedDevices.some((item) => item.id === device.id)) return;
    onUpdateField(record.id, {
      plannedDevices: [
        ...plannedDevices,
        {
          ...device,
          id: `plan-${record.id}-${device.id}`,
        },
      ],
    });
  };

  const removePlannedDevice = (id: string) => {
    onUpdateField(record.id, {
      plannedDevices: plannedDevices.filter((device) => device.id !== id),
    });
  };

  const addBlueprintAttachment = () => {
    const fileName = blueprintName.trim();
    if (!fileName) return;
    onUpdateField(record.id, {
      attachments: [...attachments, createAttachment("blueprint", fileName)],
    });
    setBlueprintName("");
  };

  const requestCompletion = (pending: PendingCompletion, notiLabel: string) => {
    onUpdateField(record.id, {
      notiHistory: [
        ...record.notiHistory,
        { id: `noti-${record.id}-${Date.now()}`, label: notiLabel },
      ],
    });
    request(pending);
    setCompletionOpen(false);
  };

  return (
    <Dialog
      open
      onClose={onClose}
      variant="drawer"
      labelledBy={titleId}
      className="flex flex-col"
    >
      <div className="border-border flex-shrink-0 border-b px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <div id={titleId} className="text-foreground text-lg font-bold">
              {record.customerName}
            </div>
            <div className="text-muted-foreground mt-1 text-[13.5px]">
              {INSTALL_KIND_META[record.kind].label} ·{" "}
              <CopyableText
                value={record.phone}
                label="전화번호"
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
          <Select
            label="상태"
            hideLabel
            value={record.status}
            onValueChange={(value) =>
              onUpdateField(record.id, { status: value as InstallStatus })
            }
            options={statusOptionsForKind(record.kind)}
            className={[
              "h-auto rounded-md border-none px-2.5 py-1 text-xs font-semibold",
              colors.pill,
            ].join(" ")}
          />
          <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-semibold">
            {SOURCE_LABEL[record.source]}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="flex flex-col gap-5">
          <Section title="기본 정보">
            <div className="grid grid-cols-2 gap-3.5">
              <Input
                label="고객명"
                value={record.customerName}
                onChange={(e) =>
                  onUpdateField(record.id, { customerName: e.target.value })
                }
              />
              <Input
                label="전화번호"
                value={record.phone}
                onChange={(e) =>
                  onUpdateField(record.id, { phone: e.target.value })
                }
              />
              <Select
                label="제품"
                value={record.product}
                onValueChange={(value) =>
                  onUpdateField(record.id, { product: value })
                }
                options={PRODUCT_OPTIONS}
              />
              <Select
                label="담당기사"
                value={record.assignedTech ?? "미배정"}
                onValueChange={(value) =>
                  onUpdateField(record.id, {
                    assignedTech: value === "미배정" ? null : value,
                  })
                }
                options={INSTALL_TECH_OPTIONS}
              />
            </div>
          </Section>

          <Section title={record.kind === "parcel" ? "배송지" : "주소"}>
            <div className="grid grid-cols-2 gap-3.5">
              <Input
                label="주소"
                hideLabel
                placeholder="주소 입력"
                value={record.address}
                onChange={(e) =>
                  onUpdateField(record.id, { address: e.target.value })
                }
              />
              <Input
                label="상세주소"
                hideLabel
                placeholder="상세주소 입력"
                value={record.addressDetail}
                onChange={(e) =>
                  onUpdateField(record.id, { addressDetail: e.target.value })
                }
              />
            </div>
          </Section>

          {showSchedule && (
            <Section title="작업 계획">
              <div className="grid grid-cols-2 gap-3.5">
                <DatePicker
                  label="설치 예정일"
                  hideLabel
                  value={record.scheduledDate ?? ""}
                  onChange={(value) =>
                    onUpdateField(record.id, { scheduledDate: value })
                  }
                />
                <Select
                  label="희망 시간대"
                  value={record.timeSlot ?? TIME_SLOT_OPTIONS[0].value}
                  onValueChange={(value) =>
                    onUpdateField(record.id, { timeSlot: value })
                  }
                  options={TIME_SLOT_OPTIONS}
                />
              </div>
              <Textarea
                label="요청사항"
                placeholder="현장 요청사항이나 설치 계획 메모"
                rows={3}
                className="mt-3.5"
                value={record.requestMemo ?? ""}
                onChange={(e) =>
                  onUpdateField(record.id, { requestMemo: e.target.value })
                }
              />
              <Textarea
                label="계획 메모"
                placeholder="기사 전달사항, 준비물, 도면 확인 내용"
                rows={3}
                className="mt-3.5"
                value={record.planMemo ?? ""}
                onChange={(e) =>
                  onUpdateField(record.id, { planMemo: e.target.value })
                }
              />
            </Section>
          )}

          {showTracking && (
            <Input
              label="송장번호"
              placeholder="택배사 송장번호 입력"
              value={record.trackingNo ?? ""}
              onChange={(e) =>
                onUpdateField(record.id, { trackingNo: e.target.value })
              }
            />
          )}

          {showSymptom && (
            <Textarea
              label="증상 · 접수 내용"
              placeholder="접수된 증상이나 요청 내용을 입력하세요"
              rows={3}
              value={record.symptom}
              onChange={(e) =>
                onUpdateField(record.id, { symptom: e.target.value })
              }
            />
          )}

          <Section title="예정 기기">
            <Input
              label="기기 검색"
              placeholder="시리얼, 모델명, 상태 검색"
              value={deviceQuery}
              onChange={(e) => setDeviceQuery(e.target.value)}
            />
            <div className="border-border mt-2 overflow-hidden rounded-lg border">
              {filteredDeviceOptions.slice(0, 4).map((device) => {
                const activeElsewhere =
                  device.status === "installed" &&
                  device.currentLocation.includes("다른 매장");
                return (
                  <button
                    key={device.id}
                    type="button"
                    onClick={() => addPlannedDevice(device)}
                    className="border-border hover:bg-muted flex w-full items-center justify-between gap-3 border-b px-3 py-2 text-left last:border-b-0"
                  >
                    <span className="min-w-0">
                      <span className="text-foreground block truncate text-sm font-semibold">
                        {device.serialNo ?? "시리얼 미정"} · {device.modelName}
                      </span>
                      <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                        {device.currentLocation}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {activeElsewhere && (
                        <AlertTriangleIcon
                          aria-label="다른 매장 설치 경고"
                          className="text-error size-4"
                        />
                      )}
                      <Badge
                        tone={activeElsewhere ? "error" : "neutral"}
                        className="whitespace-nowrap"
                      >
                        {DEVICE_STATUS_META[device.status].label}
                      </Badge>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="bg-surface-subtle mt-3 rounded-lg p-3">
              {plannedDevices.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  선택된 예정 기기가 없습니다.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {plannedDevices.map((device) => (
                    <div
                      key={device.id}
                      className="bg-card border-border flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-foreground truncate text-sm font-semibold">
                          {device.serialNo ?? "시리얼 미정"} ·{" "}
                          {device.modelName}
                        </div>
                        <div className="text-muted-foreground mt-0.5 truncate text-xs">
                          수량 {device.quantity} · {device.currentLocation}
                          {device.memo ? ` · ${device.memo}` : ""}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`${device.modelName} 예정 기기 제거`}
                        onClick={() => removePlannedDevice(device.id)}
                      >
                        <XIcon className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Section>

          <Section title="첨부">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input
                label="도면 파일명"
                hideLabel
                placeholder="도면 파일명 mock 입력"
                value={blueprintName}
                onChange={(e) => setBlueprintName(e.target.value)}
              />
              <Button onClick={addBlueprintAttachment}>
                <PaperclipIcon className="size-3.5" />
                도면 추가
              </Button>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {attachments.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  연결된 첨부가 없습니다.
                </p>
              ) : (
                attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="bg-surface-subtle flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                  >
                    <span className="text-foreground min-w-0 truncate font-semibold">
                      {attachment.fileName}
                    </span>
                    <Badge className="ml-3 shrink-0">
                      {ATTACHMENT_TYPE_LABEL[attachment.type]}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Section>

          <Section title="완료 처리">
            {record.completedAt ? (
              <div className="rounded-lg bg-emerald-500/10 p-3 text-sm">
                <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2Icon className="size-4" />
                  완료 처리됨
                </div>
                {record.resultMemo && (
                  <p className="text-foreground mt-2">{record.resultMemo}</p>
                )}
                {deviceResults.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1">
                    {deviceResults.map((device) => (
                      <span key={device.id} className="text-muted-foreground">
                        {device.serialNo} · {device.modelName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="border-border rounded-lg border p-3">
                <p className="text-muted-foreground text-sm">
                  완료 시 실제 사용 기기, 회수 기기, 완료사진, 결과 메모를
                  확정하고 매장 이력 mock에 반영합니다.
                </p>
                {canRequest && (
                  <Button
                    variant="primary"
                    className="mt-3"
                    onClick={() => setCompletionOpen(true)}
                  >
                    <UploadIcon className="size-3.5" />
                    완료 처리 요청
                  </Button>
                )}
                {workflow && (
                  <div className="mt-3">
                    <ApprovalWorkflowPanel
                      workflow={workflow}
                      loading={workflowLoading}
                      canRequest={canRequest}
                      canApproveResponsible={canApproveResponsible}
                      canApproveTeamLead={canApproveTeamLead}
                      canReject={canReject}
                      canRequestInfo={canRequestInfo}
                      canProvideInfo={canProvideInfo}
                      requestLabel="완료 처리 요청"
                      onApprove={handleApprove}
                      onConditionalApprove={conditionalApprove}
                      onReject={reject}
                      onRequestInfo={requestInfo}
                      onProvideInfo={provideInfo}
                    />
                  </div>
                )}
              </div>
            )}
          </Section>

          {storeWorkHistory.length > 0 && (
            <Section title="매장 작업 이력">
              <ul className="flex flex-col gap-1.5">
                {storeWorkHistory.map((entry) => (
                  <li
                    key={entry.id}
                    className="bg-surface-subtle rounded-lg px-3 py-2 text-sm"
                  >
                    {entry.label}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="알림톡 발송 이력">
            {record.notiHistory.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                발송 이력이 없습니다.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {record.notiHistory.map((entry) => (
                  <li
                    key={entry.id}
                    className="bg-surface-subtle rounded-lg px-3 py-2 text-sm"
                  >
                    {entry.label}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <p className="text-muted-foreground text-xs">
            등록자 {record.registeredBy} · {SOURCE_LABEL[record.source]}
          </p>
        </div>
      </div>

      {completionOpen && (
        <CompletionModal
          record={record}
          plannedDevices={plannedDevices}
          attachments={attachments}
          onClose={() => setCompletionOpen(false)}
          onComplete={requestCompletion}
        />
      )}
    </Dialog>
  );
}

interface CompletionModalProps {
  record: InstallRecord;
  plannedDevices: WorkOrderDevicePlan[];
  attachments: WorkOrderAttachment[];
  onClose: () => void;
  onComplete: (pending: PendingCompletion, notiLabel: string) => void;
}

function CompletionModal({
  record,
  plannedDevices,
  attachments,
  onClose,
  onComplete,
}: CompletionModalProps) {
  const titleId = useId();
  const [actualDevices, setActualDevices] = useState<WorkOrderDeviceResult[]>(
    () =>
      plannedDevices
        .filter((device) => device.serialNo)
        .map((device) => ({
          id: `result-${record.id}-${device.id}`,
          modelName: device.modelName,
          serialNo: device.serialNo!,
          action: record.kind === "parcel" ? "shipped" : "installed",
          memo: device.memo,
        })),
  );
  const [manualSerialNo, setManualSerialNo] = useState("");
  const [removedSerialNo, setRemovedSerialNo] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [photoMissingReason, setPhotoMissingReason] = useState(
    record.completionPhotoMissingReason ?? "",
  );
  const [resultMemo, setResultMemo] = useState(record.resultMemo ?? "");
  const [deviceMissingReason, setDeviceMissingReason] = useState("");

  const hasDeviceResult =
    actualDevices.length > 0 || deviceMissingReason.trim().length > 0;
  const hasPhoto = photoName.trim() || photoMissingReason.trim();
  const canSubmit = hasDeviceResult && hasPhoto && resultMemo.trim();

  const addManualDevice = () => {
    const serialNo = manualSerialNo.trim();
    if (!serialNo) return;
    setActualDevices((prev) => [
      ...prev,
      {
        id: `result-${record.id}-manual-${Date.now()}`,
        modelName: record.product || "현장 사용 기기",
        serialNo,
        action: record.kind === "parcel" ? "shipped" : "installed",
        memo: "완료 처리에서 추가",
      },
    ]);
    setManualSerialNo("");
  };

  const removeActualDevice = (id: string) => {
    setActualDevices((prev) => prev.filter((device) => device.id !== id));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const now = new Date().toISOString();
    const removedDevice = removedSerialNo.trim()
      ? [
          {
            id: `result-${record.id}-removed-${Date.now()}`,
            modelName: "회수 기기",
            serialNo: removedSerialNo.trim(),
            action: "removed" as const,
            memo: "완료 처리에서 회수",
          },
        ]
      : [];
    const completionAttachments = photoName.trim()
      ? [...attachments, createAttachment("completionPhoto", photoName.trim())]
      : attachments;
    const deviceSummary =
      actualDevices.length > 0
        ? actualDevices.map((device) => device.serialNo).join(", ")
        : deviceMissingReason.trim();

    onComplete(
      {
        resultMemo: resultMemo.trim(),
        completionPhotoMissingReason: photoMissingReason.trim(),
        deviceResults: [...actualDevices, ...removedDevice],
        attachments: completionAttachments,
        historyLabel: `${now.slice(0, 10)} · ${INSTALL_KIND_META[record.kind].label} 완료 · ${deviceSummary}`,
      },
      `${now.slice(0, 10)} · 완료 처리 요청`,
    );
  };

  return (
    <Dialog open onClose={onClose} labelledBy={titleId} className="w-[760px]">
      <div className="border-border border-b px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div id={titleId} className="text-foreground text-lg font-bold">
              작업 완료 처리
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {record.customerName} · {INSTALL_KIND_META[record.kind].label}
            </p>
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
      </div>

      <div className="max-h-[68vh] overflow-y-auto px-6 py-5">
        <div className="flex flex-col gap-5">
          <Section title="실제 사용 기기">
            {actualDevices.length === 0 ? (
              <p className="text-muted-foreground mb-3 text-sm">
                예정 기기에서 가져올 시리얼이 없습니다.
              </p>
            ) : (
              <div className="mb-3 flex flex-col gap-2">
                {actualDevices.map((device) => (
                  <div
                    key={device.id}
                    className="border-border flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                  >
                    <span className="text-sm">
                      <span className="text-foreground font-semibold">
                        {device.serialNo}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {device.modelName}
                      </span>
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`${device.serialNo} 실제 기기 제거`}
                      onClick={() => removeActualDevice(device.id)}
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input
                label="기기 시리얼 추가"
                hideLabel
                placeholder="현장 변경 시 실제 시리얼 추가"
                value={manualSerialNo}
                onChange={(e) => setManualSerialNo(e.target.value)}
              />
              <Button onClick={addManualDevice}>
                <PlusIcon className="size-3.5" />
                추가
              </Button>
            </div>
            {actualDevices.length === 0 && (
              <Input
                label="기기 없음 사유"
                className="mt-3"
                placeholder="기기 없이 완료하는 사유"
                value={deviceMissingReason}
                onChange={(e) => setDeviceMissingReason(e.target.value)}
              />
            )}
          </Section>

          <Section title="회수 기기">
            <Input
              label="회수 기기 시리얼"
              placeholder="회수한 기존 기기 시리얼"
              value={removedSerialNo}
              onChange={(e) => setRemovedSerialNo(e.target.value)}
            />
          </Section>

          <Section title="완료사진">
            <Input
              label="완료사진 파일명"
              placeholder="완료사진 파일명 mock 입력"
              value={photoName}
              onChange={(e) => setPhotoName(e.target.value)}
            />
            <Input
              label="사진 없음 사유"
              className="mt-3"
              placeholder="사진을 첨부하지 못한 경우 사유 입력"
              value={photoMissingReason}
              onChange={(e) => setPhotoMissingReason(e.target.value)}
            />
          </Section>

          <Section title="작업 결과">
            <Textarea
              label="결과 메모"
              hideLabel
              rows={4}
              placeholder="작업 결과와 예정과 다른 점을 입력하세요"
              value={resultMemo}
              onChange={(e) => setResultMemo(e.target.value)}
            />
          </Section>
        </div>
      </div>

      <div className="border-border flex justify-end gap-2 border-t px-6 py-4">
        <Button onClick={onClose}>취소</Button>
        <Button variant="primary" disabled={!canSubmit} onClick={handleSubmit}>
          완료 처리 요청
        </Button>
      </div>
    </Dialog>
  );
}
