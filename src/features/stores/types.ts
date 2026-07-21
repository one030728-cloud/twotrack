import type {
  DeviceStatus,
  WorkOrderAttachment,
  WorkOrderDeviceResultAction,
} from "@/features/installations/types";

export type StoreStatus = "active" | "opening" | "paused";

export const STORE_STATUS_META: Record<StoreStatus, { label: string }> = {
  active: { label: "운영중" },
  opening: { label: "오픈준비" },
  paused: { label: "중지" },
};

export interface StoreDeviceSummary {
  id: string;
  modelName: string;
  serialNo: string;
  status: DeviceStatus;
  installedAt: string;
  installedWorkOrderId: string;
}

export interface StoreWorkHistory {
  id: string;
  workedAt: string;
  typeLabel: string;
  statusLabel: string;
  assignedTech: string | null;
  resultMemo: string;
  devices: {
    serialNo: string;
    modelName: string;
    action: WorkOrderDeviceResultAction;
  }[];
}

export interface StoreRecord {
  id: string;
  name: string;
  owner: string;
  phone: string;
  businessNo: string;
  address: string;
  status: StoreStatus;
  memo: string;
  devices: StoreDeviceSummary[];
  workHistory: StoreWorkHistory[];
  attachments: WorkOrderAttachment[];
}
