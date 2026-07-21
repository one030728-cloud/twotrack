import type { InstallStatus } from "@/features/installations/types";

export interface StatusColorClasses {
  /** 배지/select 배경 등 옅은 배경 위 텍스트 조합 */
  pill: string;
}

/**
 * 상태값 11종은 installations 도메인 고유 개념이라 전역 테마 토큰이 아니라
 * 여기서 개별 고정 색으로 관리한다 (테마가 바뀌어도 동일하게 유지).
 */
export const INSTALL_STATUS_COLORS: Record<InstallStatus, StatusColorClasses> =
  {
    receipt: { pill: "!bg-zinc-500/15 !text-zinc-500" },
    productReady: { pill: "!bg-amber-500/15 !text-amber-500" },
    scheduled: { pill: "!bg-blue-500/15 !text-blue-500" },
    moving: { pill: "!bg-violet-500/15 !text-violet-500" },
    installDone: { pill: "!bg-green-500/15 !text-green-500" },
    shipped: { pill: "!bg-sky-500/15 !text-sky-500" },
    shipping: { pill: "!bg-violet-500/15 !text-violet-500" },
    received: { pill: "!bg-green-500/15 !text-green-500" },
    checking: { pill: "!bg-amber-500/15 !text-amber-500" },
    visiting: { pill: "!bg-violet-500/15 !text-violet-500" },
    asDone: { pill: "!bg-green-500/15 !text-green-500" },
  };
