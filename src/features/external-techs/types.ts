export type ExternalTechStatus = "active" | "inactive";

export const EXTERNAL_TECH_STATUS_META: Record<
  ExternalTechStatus,
  { label: string }
> = {
  active: { label: "활동중" },
  inactive: { label: "비활성" },
};

export const EXTERNAL_TECH_STATUS_ORDER: ExternalTechStatus[] = [
  "active",
  "inactive",
];

export interface ExternalTechRecord {
  id: string;
  name: string;
  phone: string;
  company: string;
  region: string;
  specialty: string;
  status: ExternalTechStatus;
  contractedAt: string | null;
  memo: string;
}

export type CreateExternalTechInput = Pick<
  ExternalTechRecord,
  "name" | "phone"
> &
  Partial<Omit<ExternalTechRecord, "id" | "name" | "phone">>;

export type UpdateExternalTechInput = Partial<Omit<ExternalTechRecord, "id">>;
