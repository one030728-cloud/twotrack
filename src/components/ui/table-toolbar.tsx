import type { ReactNode } from "react";
import { CircleHelpIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableToolbarProps {
  /** 좌측에 배치할 탭 등의 슬롯. */
  tabs: ReactNode;
  totalCount: number;
  onExport: () => void;
  exportLabel?: string;
  onHelp?: () => void;
  helpLabel?: string;
}

export function TableToolbar({
  tabs,
  totalCount,
  onExport,
  exportLabel = "엑셀 다운로드",
  onHelp,
  helpLabel = "도움말",
}: TableToolbarProps) {
  return (
    <div className="border-border flex items-center justify-between border-b">
      {tabs}
      <div className="flex shrink-0 items-center gap-3 pb-2.5">
        <span className="text-foreground text-sm font-semibold">
          전체 {totalCount}건
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="icon"
            aria-label={exportLabel}
            title={exportLabel}
            onClick={onExport}
          >
            <DownloadIcon className="size-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label={helpLabel}
            title={helpLabel}
            onClick={onHelp}
          >
            <CircleHelpIcon className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
