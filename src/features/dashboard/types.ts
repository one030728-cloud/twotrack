export type WorkQueueTabKey = "all" | "mine" | "approvals" | "risk";

export const WORK_QUEUE_TABS: { key: WorkQueueTabKey; label: string }[] = [
  { key: "all", label: "전체 업무" },
  { key: "mine", label: "내 처리함" },
  { key: "approvals", label: "내 승인함" },
  { key: "risk", label: "지연·위험업무" },
];
