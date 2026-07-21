export type ReceiptStatus =
  | "wait"
  | "docWait"
  | "docMissing"
  | "review"
  | "techWait"
  | "techDone"
  | "rejected"
  | "tossDone"
  | "done";

export const RECEIPT_STATUS_META: Record<ReceiptStatus, { label: string }> = {
  wait: { label: "정보입력" },
  docWait: { label: "서류대기" },
  docMissing: { label: "서류미비" },
  review: { label: "카드가맹접수완료" },
  techWait: { label: "토스심사접수완료" },
  techDone: { label: "카드가맹완료" },
  rejected: { label: "접수반려" },
  tossDone: { label: "토스심사완료" },
  done: { label: "완료" },
};

export const STAGE_LABELS = ["서류", "VAN", "토스", "완료"] as const;

export type ReceiptChannel =
  | "토스 홈페이지"
  | "직접 영업"
  | "전환"
  | "토스리드건"
  | "토스프리미엄"
  | "승계"
  | "명변"
  | "랜탈"
  | "할부";

export type BizType =
  "개인 사업자" | "법인 사업자" | "기가맹 개인 사업자" | "기가맹 법인 사업자";

export const RECEIPT_CHANNELS: ReceiptChannel[] = [
  "토스 홈페이지",
  "직접 영업",
  "전환",
  "토스리드건",
  "토스프리미엄",
  "승계",
  "명변",
  "랜탈",
  "할부",
];

export const BIZ_TYPES: BizType[] = [
  "개인 사업자",
  "법인 사업자",
  "기가맹 개인 사업자",
  "기가맹 법인 사업자",
];

/** VAN사 (중복선택 가능) 옵션. "전체"는 필터 전용 sentinel이라 목록엔 포함하지 않는다. */
export const VAN_OPTIONS = ["코세스2", "코세스1", "코벤", "기가맹"] as const;

export interface SelectOption {
  value: string;
  label: string;
}

export const INTERNET_OPTIONS: SelectOption[] = [
  { value: "3S", label: "3S" },
  { value: "백메가", label: "백메가" },
];

export const UNSET_LABEL = "미설정";
export const UNASSIGNED_LABEL = "미배정";

/** 상태 필터 드롭다운 전용 값. 실제 진행 상태 4종 + 전체/내 업무 pseudo 필터. */
export type StatusFilterKey =
  "all" | "mine" | "docWait" | "docMissing" | "review" | "techDone" | "done";

export const STATUS_FILTER_OPTIONS: {
  value: StatusFilterKey;
  label: string;
}[] = [
  { value: "all", label: "전체" },
  { value: "mine", label: "내 업무" },
  { value: "docWait", label: "서류 대기" },
  { value: "docMissing", label: "서류 미비" },
  { value: "review", label: "카드가맹접수완료" },
  { value: "techDone", label: "카드가맹완료" },
  { value: "done", label: "완료" },
];

export const CS_REPS = CS_REPRESENTATIVES;

export const CS_REP_OPTIONS: SelectOption[] = [...CS_REPRESENTATIVE_OPTIONS];

export const PRODUCT_OPTIONS: SelectOption[] = [
  { value: "토스프론트", label: "토스프론트" },
  { value: "토스단말기", label: "토스단말기" },
  { value: "카드단말기", label: "카드단말기" },
  { value: "포스기", label: "포스기" },
  { value: "인터넷", label: "인터넷" },
  { value: "키오스크", label: "키오스크" },
  { value: "영수증프린터", label: "영수증프린터" },
  { value: "주방프린터기", label: "주방프린터기" },
  { value: "키오스크리더기", label: "키오스크리더기" },
  { value: "무선단말기", label: "무선단말기" },
  { value: "금전함", label: "금전함" },
  { value: "태블릿", label: "태블릿" },
  { value: "테이블오더", label: "테이블오더" },
  { value: "보조배터리", label: "보조배터리" },
  { value: "원격", label: "원격" },
];

/** 목록/등록/상세에서 공유하는 상태 선택 옵션 (상태 필터의 4종 요약과 달리 전체 9종 실제 상태값) */
export const RECEIPT_STATUS_OPTIONS: { value: ReceiptStatus; label: string }[] =
  Object.entries(RECEIPT_STATUS_META).map(([key, m]) => ({
    value: key as ReceiptStatus,
    label: m.label,
  }));

export interface MemoEntry {
  id: string;
  /** 표시용 날짜/작성자 텍스트, 예: "2026.07.13 · 시스템", "07.15 기한" */
  meta: string;
  content: string;
  pinned: boolean;
}

export interface FranchiseReceipt {
  id: number;
  receiptDate: string;
  channel: ReceiptChannel | null;
  bizType: BizType | null;
  name: string;
  owner: string;
  phone: string;
  bizNo: string;
  salesRep: string;
  csRep: string | null;
  internet: string | null;
  status: ReceiptStatus;
  /** 진행 단계 인덱스 (0~4), STAGE_LABELS 기준 */
  stage: number;
  due: string;
  memo: string;
  memoHistory: MemoEntry[];
  isMine: boolean;
  unassigned: boolean;
}

export type ReceiptTabKey =
  "all" | "mine" | "docMissing" | "rejected" | "review" | "techDone";

export interface ReceiptTabDef {
  key: ReceiptTabKey;
  label: string;
}

export const RECEIPT_TABS: ReceiptTabDef[] = [
  { key: "all", label: "전체" },
  { key: "mine", label: "내 업무" },
  { key: "docMissing", label: "서류 미비" },
  { key: "rejected", label: "접수 반려" },
  { key: "review", label: "심사 대기" },
  { key: "techDone", label: "승인 완료" },
];

export function matchesReceiptTab(
  receipt: FranchiseReceipt,
  tab: ReceiptTabKey,
): boolean {
  switch (tab) {
    case "all":
      return true;
    case "mine":
      return receipt.isMine;
    case "docMissing":
      return receipt.status === "docMissing";
    case "rejected":
      return receipt.status === "rejected";
    case "review":
      return receipt.status === "review";
    case "techDone":
      return receipt.status === "techDone";
  }
}

export type ReceiptKpiKey =
  "today" | "docWait" | "docMissing" | "review" | "doneToday";

export interface ReceiptKpi {
  key: ReceiptKpiKey;
  label: string;
  value: number;
}

export type CreateReceiptInput = Partial<
  Omit<FranchiseReceipt, "id" | "stage" | "salesRep" | "unassigned">
> &
  Pick<FranchiseReceipt, "name" | "owner" | "phone">;
import {
  CS_REPRESENTATIVES,
  CS_REPRESENTATIVE_OPTIONS,
} from "@/lib/cs-representatives";
