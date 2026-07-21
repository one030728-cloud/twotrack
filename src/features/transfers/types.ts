export type TransferStatus = "receipt" | "processing" | "done";

export const TRANSFER_STATUS_META: Record<TransferStatus, { label: string }> = {
  receipt: { label: "접수" },
  processing: { label: "처리중" },
  done: { label: "완료" },
};

export const TRANSFER_STATUS_ORDER: TransferStatus[] = [
  "receipt",
  "processing",
  "done",
];

export type TransferType = "명의변경" | "이전설치" | "폐업철거" | "기타";

export const TRANSFER_TYPE_OPTIONS: TransferType[] = [
  "명의변경",
  "이전설치",
  "폐업철거",
  "기타",
];

export interface TransferRecord {
  id: string;
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

export type CreateTransferInput = Pick<
  TransferRecord,
  "name" | "owner" | "phone" | "transferType"
> &
  Partial<
    Omit<TransferRecord, "id" | "name" | "owner" | "phone" | "transferType">
  >;

export type UpdateTransferInput = Partial<Omit<TransferRecord, "id">>;
