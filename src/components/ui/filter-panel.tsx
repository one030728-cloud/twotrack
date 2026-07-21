"use client";

import { useState, type ReactNode } from "react";
import {
  ChevronDownIcon,
  ListFilterIcon,
  RotateCcwIcon,
  SearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FilterPanelProps {
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder: string;
  children: ReactNode;
  searchLabel?: string;
  filterLabel?: string;
  defaultOpen?: boolean;
  onReset?: () => void;
  resetLabel?: string;
}

export function FilterPanel({
  query,
  onQueryChange,
  searchPlaceholder,
  children,
  searchLabel = "통합 검색",
  filterLabel = "고급 필터",
  defaultOpen = true,
  onReset,
  resetLabel = "초기화",
}: FilterPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-border bg-card flex flex-col gap-2.5 rounded-xl border p-3.5">
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-[440px]">
          <SearchIcon
            aria-hidden="true"
            className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
          />
          <Input
            label={searchLabel}
            hideLabel
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex-1" />
        {onReset && (
          <Button
            variant="secondary"
            size="icon"
            onClick={onReset}
            title={resetLabel}
            aria-label={resetLabel}
            className="size-8"
          >
            <RotateCcwIcon className="size-3.5" />
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
        >
          <ListFilterIcon className="size-3.5" />
          {filterLabel}
          <ChevronDownIcon
            className={[
              "size-3 transition-transform",
              open ? "rotate-180" : "",
            ].join(" ")}
          />
        </Button>
      </div>
      {open && (
        <div className="border-border flex flex-wrap items-center gap-2 border-t pt-2.5">
          {children}
        </div>
      )}
    </section>
  );
}
