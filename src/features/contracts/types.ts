export type ContractStatus = "draft" | "pending" | "signed";

export const CONTRACT_STATUS_META: Record<ContractStatus, { label: string }> = {
  draft: { label: "초안" },
  pending: { label: "서명대기" },
  signed: { label: "서명완료" },
};

export const CONTRACT_STATUS_ORDER: ContractStatus[] = [
  "draft",
  "pending",
  "signed",
];

export interface ContractRecord {
  id: string;
  merchantName: string;
  ownerName: string;
  phone: string;
  fileName: string;
  status: ContractStatus;
  sentAt: string | null;
  signedAt: string | null;
  memo: string;
}

export type CreateContractInput = Pick<
  ContractRecord,
  "merchantName" | "ownerName" | "phone"
> &
  Partial<Omit<ContractRecord, "id" | "merchantName" | "ownerName" | "phone">>;

export type UpdateContractInput = Partial<Omit<ContractRecord, "id">>;
