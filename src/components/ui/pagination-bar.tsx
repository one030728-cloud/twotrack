"use client";

import type { ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

function buildPageRange(current: number, total: number): number[] {
  const maxButtons = 5;
  let start = Math.max(1, current - 2);
  const end = Math.min(total, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  leading?: ReactNode;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
  leading,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: PaginationBarProps) {
  const safeTotal = Math.max(1, totalPages);
  const safeCurrent = Math.min(Math.max(1, currentPage), safeTotal);
  const pages = buildPageRange(safeCurrent, safeTotal);

  return (
    <div className="relative flex min-h-14 items-center justify-between gap-3.5 px-4 py-2.5">
      <div>{leading}</div>
      <div className="flex items-center gap-3.5">
        <nav aria-label="페이지 탐색" className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label="이전 페이지"
            disabled={safeCurrent <= 1}
            onClick={() =>
              onPrevious ? onPrevious() : onPageChange(safeCurrent - 1)
            }
          >
            <ChevronLeftIcon className="size-3.5" />
          </Button>
          {pages.map((page) => (
            <button
              key={page}
              type="button"
              aria-label={`${page}페이지`}
              aria-current={page === safeCurrent ? "page" : undefined}
              onClick={() => onPageChange(page)}
              className={[
                "flex size-7 items-center justify-center rounded-md border text-xs font-semibold",
                page === safeCurrent
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-muted",
              ].join(" ")}
            >
              {page}
            </button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            aria-label="다음 페이지"
            disabled={safeCurrent >= safeTotal}
            onClick={() => (onNext ? onNext() : onPageChange(safeCurrent + 1))}
          >
            <ChevronRightIcon className="size-3.5" />
          </Button>
        </nav>
        {pageSize !== undefined && onPageSizeChange && (
          <Select
            label="페이지당 표시 개수"
            hideLabel
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
            options={pageSizeOptions.map((size) => ({
              value: String(size),
              label: `${size}개씩 보기`,
            }))}
            className="h-8 py-0 text-xs"
          />
        )}
      </div>
    </div>
  );
}
