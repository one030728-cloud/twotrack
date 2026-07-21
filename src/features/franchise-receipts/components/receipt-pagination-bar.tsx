import { Button } from "@/components/ui/button";
import { BulkPaginationBar } from "@/components/ui/bulk-pagination-bar";

interface ReceiptPaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onGoToPage: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  selectedCount: number;
  totalFilteredCount: number;
  onSelectAllFiltered: () => void;
}

export function ReceiptPaginationBar({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onGoToPage,
  pageSize,
  onPageSizeChange,
  selectedCount,
  totalFilteredCount,
  onSelectAllFiltered,
}: ReceiptPaginationBarProps) {
  return (
    <BulkPaginationBar
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onGoToPage}
      onPrevious={onPrev}
      onNext={onNext}
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      selectedCount={selectedCount}
      totalFilteredCount={totalFilteredCount}
      onSelectAllFiltered={onSelectAllFiltered}
      actions={
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
          <Button
            variant="primary"
            size="sm"
            disabled
            title="다음 단계에서 지원 예정"
          >
            기술지원 이관
          </Button>
        </div>
      }
    />
  );
}
