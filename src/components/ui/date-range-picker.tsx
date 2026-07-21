"use client";

import { CalendarIcon } from "lucide-react";
import { DayPicker, type DateRange } from "react-day-picker";
import { ko } from "react-day-picker/locale";
import {
  CALENDAR_CLASSNAMES,
  formatDate,
  parseDate as parseSingleDate,
} from "@/components/ui/date-picker";
import { Popover, PopoverPanel } from "@/components/ui/popover";

export interface DateRangeValue {
  from: string | null;
  to: string | null;
}

export interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  label?: string;
  hideLabel?: boolean;
  className?: string;
}

function parseDate(value: string | null): Date | undefined {
  return value ? parseSingleDate(value) : undefined;
}

const CALENDAR_RANGE_CLASSNAMES = {
  ...CALENDAR_CLASSNAMES,
  selected: "",
  range_start:
    "!rounded-l-md [&_button]:!bg-primary [&_button]:!text-primary-foreground [&_button]:hover:!bg-primary",
  range_end:
    "!rounded-r-md [&_button]:!bg-primary [&_button]:!text-primary-foreground [&_button]:hover:!bg-primary",
  range_middle:
    "[&_button]:!bg-primary-muted [&_button]:!text-primary [&_button]:!rounded-none",
};

export function DateRangePicker({
  value,
  onChange,
  label,
  hideLabel,
  className,
}: DateRangePickerProps) {
  const selected: DateRange | undefined =
    value.from || value.to
      ? { from: parseDate(value.from), to: parseDate(value.to) }
      : undefined;
  const hasValue = Boolean(value.from || value.to);

  return (
    <Popover className="block min-w-0">
      {({ open, toggle, close, panelId }) => (
        <div className="flex min-w-0 flex-col gap-1.5">
          {label && (
            <span
              className={
                hideLabel ? "sr-only" : "text-muted-foreground text-xs"
              }
            >
              {label}
            </span>
          )}
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={hideLabel ? label : undefined}
            onClick={toggle}
            className={[
              "border-border bg-card focus-visible:border-primary flex h-9 w-full min-w-0 items-center gap-1.5 rounded-lg border px-3 text-sm outline-none",
              open ? "border-primary" : "",
              hasValue ? "text-foreground" : "text-muted-foreground",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <CalendarIcon
              aria-hidden="true"
              className="text-muted-foreground size-3.5 shrink-0"
            />
            <span className="min-w-0 truncate whitespace-nowrap">
              {value.from ?? "YYYY-MM-DD"} ~ {value.to ?? "YYYY-MM-DD"}
            </span>
          </button>
          {open && (
            <PopoverPanel
              id={panelId}
              align="start"
              role="dialog"
              aria-label={label}
              className="p-2"
            >
              <DayPicker
                mode="range"
                locale={ko}
                selected={selected}
                defaultMonth={selected?.from}
                onSelect={(range) => {
                  onChange({
                    from: range?.from ? formatDate(range.from) : null,
                    to: range?.to ? formatDate(range.to) : null,
                  });
                }}
                classNames={CALENDAR_RANGE_CLASSNAMES}
              />
              <div className="flex items-center justify-between px-1 pt-1.5">
                <button
                  type="button"
                  onClick={() => onChange({ from: null, to: null })}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  초기화
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="text-primary text-xs font-semibold hover:underline"
                >
                  확인
                </button>
              </div>
            </PopoverPanel>
          )}
        </div>
      )}
    </Popover>
  );
}
