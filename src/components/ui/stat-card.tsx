import type { LucideIcon } from "lucide-react";

export type StatCardTone = "blue" | "amber" | "red" | "green" | "slate";

const toneStyles: Record<StatCardTone, string> = {
  blue: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
  amber: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
  red: "bg-red-500/12 text-red-600 dark:text-red-400",
  green: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  slate: "bg-muted text-muted-foreground",
};

interface StatCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  icon: LucideIcon;
  tone?: StatCardTone;
  /** 지정하면 카드 전체가 버튼으로 렌더링된다(예: KPI 필터 트리거). */
  onClick?: () => void;
  /** onClick과 함께 쓰는 선택 상태 표시. */
  active?: boolean;
  /** 접근 가능한 이름을 직접 지정하고 싶을 때. 미지정 시 카드 안 텍스트로 계산된다. */
  ariaLabel?: string;
}

export function StatCard({
  label,
  value,
  suffix = "건",
  icon: Icon,
  tone = "blue",
  onClick,
  active,
  ariaLabel,
}: StatCardProps) {
  const iconBadge = (
    <span
      className={[
        "flex size-11 shrink-0 items-center justify-center rounded-full",
        toneStyles[tone],
      ].join(" ")}
    >
      <Icon className="size-5" />
    </span>
  );
  const content = (
    <span className="min-w-0">
      <span className="text-muted-foreground block truncate text-xs">
        {label}
      </span>
      <span className="text-foreground mt-1 block text-2xl font-bold">
        {value}
        {suffix && (
          <small className="text-muted-foreground ml-1 text-xs font-medium">
            {suffix}
          </small>
        )}
      </span>
    </span>
  );

  if (onClick) {
    return (
      <button
        type="button"
        aria-label={ariaLabel ?? `${label} ${value}${suffix ?? ""}`}
        aria-pressed={active}
        onClick={onClick}
        className={[
          "bg-card shadow-card hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/30 flex min-h-24 items-center gap-3 rounded-xl border px-5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
          active ? "border-primary ring-primary/20 ring-2" : "border-border",
        ].join(" ")}
      >
        {iconBadge}
        {content}
      </button>
    );
  }

  return (
    <article className="border-border bg-card shadow-card flex min-h-20 items-center gap-3 rounded-xl border px-4 py-3">
      {iconBadge}
      {content}
    </article>
  );
}
