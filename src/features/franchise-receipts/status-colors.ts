import type { ReceiptStatus } from "@/features/franchise-receipts/types";

export interface StatusColorClasses {
  /** 배지/select 배경 등 옅은 배경 위 텍스트 조합 */
  pill: string;
  /** 진행바 라인/점처럼 단색 배경이 필요한 곳 */
  solid: string;
  /** 진행바 점 테두리 등 */
  border: string;
}

/**
 * 접수 상태 9종은 franchise-receipts 도메인 고유 개념이라 전역 테마 토큰이 아니라
 * 여기서 개별 고정 색으로 관리한다 (테마가 바뀌어도 동일하게 유지).
 */
export const STATUS_COLORS: Record<ReceiptStatus, StatusColorClasses> = {
  wait: {
    pill: "!bg-zinc-500/15 !text-zinc-500",
    solid: "bg-zinc-500",
    border: "border-zinc-500",
  },
  docWait: {
    pill: "!bg-amber-500/15 !text-amber-500",
    solid: "bg-amber-500",
    border: "border-amber-500",
  },
  docMissing: {
    pill: "!bg-red-500/15 !text-red-500",
    solid: "bg-red-500",
    border: "border-red-500",
  },
  review: {
    pill: "!bg-blue-500/15 !text-blue-500",
    solid: "bg-blue-500",
    border: "border-blue-500",
  },
  techWait: {
    pill: "!bg-violet-500/15 !text-violet-500",
    solid: "bg-violet-500",
    border: "border-violet-500",
  },
  techDone: {
    pill: "!bg-sky-500/15 !text-sky-500",
    solid: "bg-sky-500",
    border: "border-sky-500",
  },
  rejected: {
    pill: "!bg-red-500/15 !text-red-500",
    solid: "bg-red-500",
    border: "border-red-500",
  },
  tossDone: {
    pill: "!bg-teal-500/15 !text-teal-500",
    solid: "bg-teal-500",
    border: "border-teal-500",
  },
  done: {
    pill: "!bg-green-500/15 !text-green-500",
    solid: "bg-green-500",
    border: "border-green-500",
  },
};
