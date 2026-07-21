export type InstallKind = "install" | "parcel" | "as";

export const INSTALL_KIND_META: Record<
  InstallKind,
  { label: string; description: string }
> = {
  install: {
    label: "설치",
    description: "방문 설치 접수와 진행 상태를 관리합니다.",
  },
  parcel: {
    label: "택배발송",
    description: "택배로 발송하는 건의 배송 상태를 관리합니다.",
  },
  as: {
    label: "AS",
    description: "AS 접수와 처리 상태를 관리합니다.",
  },
};

export const INSTALL_KIND_ORDER: InstallKind[] = ["install", "parcel", "as"];

export type InstallStatus =
  | "receipt"
  | "productReady"
  | "scheduled"
  | "moving"
  | "installDone"
  | "shipped"
  | "shipping"
  | "received"
  | "checking"
  | "visiting"
  | "asDone";

export const INSTALL_STATUS_META: Record<InstallStatus, { label: string }> = {
  receipt: { label: "접수" },
  productReady: { label: "제품준비" },
  scheduled: { label: "일정확정" },
  moving: { label: "이동중" },
  installDone: { label: "설치완료" },
  shipped: { label: "발송완료" },
  shipping: { label: "배송중" },
  received: { label: "수령확인" },
  checking: { label: "점검·부품확인" },
  visiting: { label: "방문중" },
  asDone: { label: "처리완료" },
};

/** 구분별 5단계 상태 흐름. 라벨/의미는 구분마다 달라 상태값 자체를 공유하지 않는다. */
export const STATUS_FLOW_BY_KIND: Record<InstallKind, InstallStatus[]> = {
  install: ["receipt", "productReady", "scheduled", "moving", "installDone"],
  parcel: ["receipt", "productReady", "shipped", "shipping", "received"],
  as: ["receipt", "checking", "scheduled", "visiting", "asDone"],
};

export function statusOptionsForKind(
  kind: InstallKind,
): { value: InstallStatus; label: string }[] {
  return STATUS_FLOW_BY_KIND[kind].map((status) => ({
    value: status,
    label: INSTALL_STATUS_META[status].label,
  }));
}

export type InstallSource = "franchise" | "manual";

export interface NotiHistoryEntry {
  id: string;
  /** 표시용 일시/템플릿 텍스트, 예: "2026.07.16 10:20 · 설치 예정 안내" */
  label: string;
}

export type DeviceStatus =
  "stock" | "assignedToTech" | "installed" | "shipped" | "defective";

export const DEVICE_STATUS_META: Record<DeviceStatus, { label: string }> = {
  stock: { label: "재고" },
  assignedToTech: { label: "기사 보유" },
  installed: { label: "매장 설치" },
  shipped: { label: "발송" },
  defective: { label: "불량" },
};

export interface WorkOrderDevicePlan {
  id: string;
  modelName: string;
  serialNo: string | null;
  quantity: number;
  status: DeviceStatus;
  currentLocation: string;
  memo: string;
}

export type WorkOrderDeviceResultAction =
  "installed" | "removed" | "shipped" | "returned";

export interface WorkOrderDeviceResult {
  id: string;
  modelName: string;
  serialNo: string;
  action: WorkOrderDeviceResultAction;
  memo: string;
}

export type WorkOrderAttachmentType =
  "blueprint" | "completionPhoto" | "sitePhoto" | "document";

export interface WorkOrderAttachment {
  id: string;
  type: WorkOrderAttachmentType;
  fileName: string;
  uploadedAt: string;
}

export interface StoreWorkHistoryEntry {
  id: string;
  label: string;
}

export interface InstallRecord {
  id: number;
  kind: InstallKind;
  customerName: string;
  phone: string;
  address: string;
  addressDetail: string;
  /** 기기/제품 관리가 별도로 생기기 전까지의 임시 정적 옵션 값 (seam) */
  product: string;
  status: InstallStatus;
  assignedTech: string | null;
  /** 택배발송·일부 설치 건에서만 사용 */
  trackingNo: string | null;
  /** 설치·AS(방문형)에서만 사용, YYYY-MM-DD */
  scheduledDate: string | null;
  timeSlot: string | null;
  /** AS 접수 시 증상/요청 내용 */
  symptom: string;
  registeredBy: string;
  /** ISO datetime */
  registeredAt: string;
  source: InstallSource;
  sourceReceiptId?: number;
  memo: string;
  notiHistory: NotiHistoryEntry[];
  requestMemo?: string;
  planMemo?: string;
  plannedDevices?: WorkOrderDevicePlan[];
  deviceResults?: WorkOrderDeviceResult[];
  attachments?: WorkOrderAttachment[];
  completionPhotoMissingReason?: string;
  resultMemo?: string;
  completedAt?: string | null;
  storeWorkHistory?: StoreWorkHistoryEntry[];
}

export type CreateInstallInput = Partial<
  Omit<
    InstallRecord,
    "id" | "status" | "source" | "registeredBy" | "registeredAt"
  >
> &
  Pick<InstallRecord, "kind" | "customerName" | "phone">;

export type InstallStatusTabKey = InstallStatus | "all";

export interface InstallStatusTabDef {
  key: InstallStatusTabKey;
  label: string;
}

export function statusTabsForKind(kind: InstallKind): InstallStatusTabDef[] {
  return [
    { key: "all", label: "전체" },
    ...STATUS_FLOW_BY_KIND[kind].map((status) => ({
      key: status,
      label: INSTALL_STATUS_META[status].label,
    })),
  ];
}

export function matchesInstallStatusTab(
  record: InstallRecord,
  tab: InstallStatusTabKey,
): boolean {
  return tab === "all" || record.status === tab;
}

export const INSTALL_TECHS = ["박기사", "이기사", "최기사"] as const;

export const INSTALL_TECH_OPTIONS: { value: string; label: string }[] = [
  ...INSTALL_TECHS.map((tech) => ({ value: tech, label: tech })),
  { value: "미배정", label: "미배정" },
];

/** 기기/제품 관리가 생기기 전까지의 임시 정적 목록 (seam) */
export const PRODUCT_OPTIONS: { value: string; label: string }[] = [
  { value: "카드단말기 A100", label: "카드단말기 A100" },
  { value: "카드단말기 A100 + 프린터", label: "카드단말기 A100 + 프린터" },
  { value: "프린터 단품", label: "프린터 단품" },
];

export const MOCK_DEVICE_OPTIONS: WorkOrderDevicePlan[] = [
  {
    id: "device-a100-01",
    modelName: "카드단말기 A100",
    serialNo: "A100-2407-001",
    quantity: 1,
    status: "stock",
    currentLocation: "본사 재고",
    memo: "",
  },
  {
    id: "device-a100-02",
    modelName: "카드단말기 A100",
    serialNo: "A100-2407-014",
    quantity: 1,
    status: "assignedToTech",
    currentLocation: "박기사",
    memo: "",
  },
  {
    id: "device-printer-01",
    modelName: "영수증 프린터 P20",
    serialNo: "P20-2406-033",
    quantity: 1,
    status: "stock",
    currentLocation: "본사 재고",
    memo: "",
  },
  {
    id: "device-a100-legacy",
    modelName: "카드단말기 A100",
    serialNo: "A100-2312-117",
    quantity: 1,
    status: "installed",
    currentLocation: "다른 매장 active",
    memo: "이미 설치된 기기",
  },
];

export const TIME_SLOT_OPTIONS: { value: string; label: string }[] = [
  { value: "오전(10~13시)", label: "오전(10~13시)" },
  { value: "오후(14~17시)", label: "오후(14~17시)" },
  { value: "협의 필요", label: "협의 필요" },
];

export type SortOrder = "latest" | "oldest";
