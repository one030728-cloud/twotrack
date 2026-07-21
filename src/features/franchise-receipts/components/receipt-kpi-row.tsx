import {
  CheckIcon,
  ClockIcon,
  FileTextIcon,
  FileWarningIcon,
  SearchIcon,
  type LucideIcon,
} from "lucide-react";
import { StatCard, type StatCardTone } from "@/components/ui/stat-card";
import type {
  ReceiptKpi,
  ReceiptKpiKey,
} from "@/features/franchise-receipts/types";

const KPI_PRESENTATION: Record<
  ReceiptKpiKey,
  { icon: LucideIcon; tone: StatCardTone }
> = {
  today: { icon: FileTextIcon, tone: "blue" },
  docWait: { icon: ClockIcon, tone: "amber" },
  docMissing: { icon: FileWarningIcon, tone: "red" },
  review: { icon: SearchIcon, tone: "blue" },
  doneToday: { icon: CheckIcon, tone: "green" },
};

interface ReceiptKpiRowProps {
  kpis: ReceiptKpi[];
  onKpiClick: (key: ReceiptKpiKey) => void;
}

export function ReceiptKpiRow({ kpis, onKpiClick }: ReceiptKpiRowProps) {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
      {kpis.map((kpi) => {
        const presentation = KPI_PRESENTATION[kpi.key];
        return (
          <StatCard
            key={kpi.key}
            label={kpi.label}
            value={kpi.value}
            icon={presentation.icon}
            tone={presentation.tone}
            onClick={() => onKpiClick(kpi.key)}
          />
        );
      })}
    </div>
  );
}
