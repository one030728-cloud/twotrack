export type MerchantStatus = "consulting" | "contracted" | "terminated";

export const MERCHANT_STATUS_META: Record<MerchantStatus, { label: string }> = {
  consulting: { label: "상담중" },
  contracted: { label: "계약완료" },
  terminated: { label: "해지" },
};

export const MERCHANT_STATUS_ORDER: MerchantStatus[] = [
  "consulting",
  "contracted",
  "terminated",
];

export interface MerchantRecord {
  id: string;
  name: string;
  owner: string;
  phone: string;
  businessNo: string;
  address: string;
  status: MerchantStatus;
  manager: string;
  contractDate: string | null;
  memo: string;
}

export type CreateMerchantInput = Pick<
  MerchantRecord,
  "name" | "owner" | "phone"
> &
  Partial<Omit<MerchantRecord, "id" | "name" | "owner" | "phone">>;

export type UpdateMerchantInput = Partial<Omit<MerchantRecord, "id">>;
