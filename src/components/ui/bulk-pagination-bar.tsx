import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { PaginationBar } from "@/components/ui/pagination-bar";

interface BulkPaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  selectedCount: number;
  totalFilteredCount: number;
  onSelectAllFiltered: () => void;
  actions?: ReactNode;
}

export function BulkPaginationBar({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
  pageSize,
  onPageSizeChange,
  selectedCount,
  totalFilteredCount,
  onSelectAllFiltered,
  actions,
}: BulkPaginationBarProps) {
  return (
    <PaginationBar
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onPrevious={onPrevious}
      onNext={onNext}
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      leading={
        selectedCount > 0 ? (
          <div className="border-border bg-card shadow-card flex flex-wrap items-center gap-3 rounded-lg border px-3.5 py-2">
            <span className="text-foreground text-sm font-semibold">
              {selectedCount}건 선택됨
            </span>
            {selectedCount < totalFilteredCount && (
              <button
                type="button"
                onClick={onSelectAllFiltered}
                className="text-primary text-xs font-semibold hover:underline"
              >
                필터링된 전체 {totalFilteredCount}건 선택
              </button>
            )}
            {actions ?? (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled
                  title="다음 단계에서 지원 예정"
                >
                  일괄 상태 변경
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled
                  title="다음 단계에서 지원 예정"
                >
                  일괄 배정
                </Button>
                <button
                  type="button"
                  disabled
                  title="다음 단계에서 지원 예정"
                  className="border-error/30 bg-error/10 text-error hover:bg-error/20 h-8 rounded-lg border px-3 text-xs font-semibold disabled:pointer-events-none disabled:opacity-50"
                >
                  선택 삭제
                </button>
              </div>
            )}
          </div>
        ) : undefined
      }
    />
  );
}
