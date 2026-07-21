import { STATUS_COLORS } from "@/features/franchise-receipts/status-colors";
import {
  STAGE_LABELS,
  type ReceiptStatus,
} from "@/features/franchise-receipts/types";

function fraction(idx: number): number {
  return idx / (STAGE_LABELS.length - 1);
}

export function StageProgress({
  stage,
  status,
}: {
  stage: number;
  status: ReceiptStatus;
}) {
  const clamped = Math.min(stage, STAGE_LABELS.length - 1);
  const { solid, border } = STATUS_COLORS[status];

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="relative h-2.5 w-full">
        <div className="bg-border absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2" />
        {clamped > 0 && (
          <div
            className={[
              "absolute top-1/2 left-0 h-0.5 -translate-y-1/2",
              solid,
            ].join(" ")}
            style={{ width: `${fraction(clamped) * 100}%` }}
          />
        )}
        {STAGE_LABELS.map((label, idx) => (
          <div
            key={label}
            className={[
              "absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2",
              idx < clamped
                ? `${solid} ${border}`
                : idx === clamped
                  ? `bg-card ${border}`
                  : "bg-card border-border-strong",
            ].join(" ")}
            style={{ left: `${fraction(idx) * 100}%` }}
          />
        ))}
      </div>
      <div className="relative h-3 w-full">
        {STAGE_LABELS.map((label, idx) => (
          <span
            key={label}
            className={[
              "text-muted-foreground absolute top-0 text-[9.5px] whitespace-nowrap",
              idx === 0
                ? "left-0"
                : idx === STAGE_LABELS.length - 1
                  ? "right-0"
                  : "-translate-x-1/2",
            ].join(" ")}
            style={
              idx === 0 || idx === STAGE_LABELS.length - 1
                ? undefined
                : { left: `${fraction(idx) * 100}%` }
            }
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
