"use client";

import { useId, useMemo, useState } from "react";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { Popover, PopoverPanel } from "@/components/ui/popover";
import type { SelectOption } from "@/features/franchise-receipts/types";

interface ProductComboboxProps {
  label: string;
  value: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
}

export function ProductCombobox({
  label,
  value,
  options,
  onValueChange,
}: ProductComboboxProps) {
  const labelId = useId();
  const selected = options.find((option) => option.value === value);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  return (
    <Popover className="block w-full">
      {({ open, toggle, close, panelId }) => (
        <div className="flex min-w-0 flex-col gap-1.5">
          <span id={labelId} className="text-muted-foreground text-xs">
            {label}
          </span>
          <button
            type="button"
            aria-labelledby={labelId}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={toggle}
            className="border-border bg-card text-foreground focus-visible:ring-primary/30 flex h-9 w-full items-center justify-between gap-2 rounded-lg border px-3 text-left text-sm outline-none focus-visible:ring-2"
          >
            <span className="min-w-0 flex-1 truncate">
              {selected?.label ?? value}
            </span>
            <ChevronDownIcon
              aria-hidden="true"
              className="text-muted-foreground size-3.5 shrink-0"
            />
          </button>
          {open && (
            <PopoverPanel
              id={panelId}
              role="dialog"
              align="start"
              aria-labelledby={labelId}
              className="w-full min-w-0 p-1.5"
            >
              <div className="border-border bg-card flex h-9 items-center gap-2 rounded-lg border px-2.5">
                <SearchIcon
                  aria-hidden="true"
                  className="text-muted-foreground size-3.5 shrink-0"
                />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="상품 검색"
                  className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              <div className="mt-1 max-h-52 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="text-muted-foreground px-3 py-3 text-sm">
                    검색 결과가 없습니다.
                  </p>
                ) : (
                  filtered.map((option) => {
                    const active = option.value === value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          onValueChange(option.value);
                          setQuery("");
                          close();
                        }}
                        className="hover:bg-muted flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm"
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {option.label}
                        </span>
                        {active && (
                          <CheckIcon
                            aria-hidden="true"
                            className="text-primary size-3.5 shrink-0"
                          />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </PopoverPanel>
          )}
        </div>
      )}
    </Popover>
  );
}
