"use client";

import { useId } from "react";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { ko } from "react-day-picker/locale";
import { Popover, PopoverPanel } from "@/components/ui/popover";

export interface DatePickerProps {
  /** "YYYY-MM-DD" 형식의 날짜 값을 표시한다. 직접 입력은 허용하지 않는다. */
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hideLabel?: boolean;
  className?: string;
}

export function parseDate(value: string): Date | undefined {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const CALENDAR_CLASSNAMES = {
  months: "flex flex-col gap-2",
  month: "space-y-2",
  month_caption:
    "flex items-center justify-center py-1 text-sm font-semibold text-foreground",
  nav: "flex items-center justify-between absolute inset-x-1 top-1",
  button_previous:
    "text-muted-foreground hover:bg-muted flex size-7 items-center justify-center rounded-md [&_svg]:size-4",
  button_next:
    "text-muted-foreground hover:bg-muted flex size-7 items-center justify-center rounded-md [&_svg]:size-4",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  // 일요일은 빨강, 토요일은 파랑 — 한 주가 항상 일~토 순서라
  // 첫/마지막 칸을 first:/last:로 지정하는 것만으로 요일 판별이 된다.
  weekday:
    "text-muted-foreground w-8 text-center text-xs font-medium first:text-red-500 last:text-blue-500",
  week: "flex w-full mt-1",
  day: "size-8 p-0 text-center text-sm first:[&_button]:text-red-500 last:[&_button]:text-blue-500",
  day_button:
    "size-8 rounded-md text-sm text-foreground hover:bg-muted flex items-center justify-center",
  today: "[&_button]:!text-primary [&_button]:font-bold",
  selected:
    "[&_button]:!bg-primary [&_button]:!text-primary-foreground [&_button]:hover:!bg-primary",
  outside: "[&_button]:!text-muted-foreground/50",
  disabled: "[&_button]:!text-muted-foreground/30",
};

function CalendarPopoverPanel({
  panelId,
  ariaLabel,
  selected,
  onSelect,
}: {
  panelId: string;
  ariaLabel?: string;
  selected: Date | undefined;
  onSelect: (date: Date) => void;
}) {
  return (
    <PopoverPanel
      id={panelId}
      align="start"
      role="dialog"
      aria-label={ariaLabel}
      className="p-2"
    >
      <DayPicker
        mode="single"
        locale={ko}
        selected={selected}
        defaultMonth={selected}
        onSelect={(date) => {
          if (!date) return;
          onSelect(date);
        }}
        classNames={CALENDAR_CLASSNAMES}
      />
    </PopoverPanel>
  );
}

/** 테이블 셀 등 좁은 영역에서 쓰는 라벨 없는 컴팩트 날짜 버튼. */
export function InlineDatePicker({
  value,
  onChange,
  ariaLabel,
  dialogAriaLabel = ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  /** 달력 다이얼로그에 붙는 라벨. 미지정 시 ariaLabel을 그대로 쓴다. */
  dialogAriaLabel?: string;
}) {
  const selected = parseDate(value);

  return (
    <Popover>
      {({ open, toggle, close, panelId }) => (
        <div className="relative">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={ariaLabel}
            onClick={toggle}
            className="text-foreground hover:text-primary focus-visible:ring-primary/30 flex h-7 max-w-full items-center gap-1.5 truncate rounded-sm text-left focus-visible:ring-2 focus-visible:outline-none"
          >
            <CalendarIcon className="text-muted-foreground size-3.5 shrink-0" />
            <span className="truncate">{value || "YYYY-MM-DD"}</span>
          </button>
          {open && (
            <CalendarPopoverPanel
              panelId={panelId}
              ariaLabel={dialogAriaLabel}
              selected={selected}
              onSelect={(date) => {
                onChange(formatDate(date));
                close();
              }}
            />
          )}
        </div>
      )}
    </Popover>
  );
}

/** 텍스트 입력 + 달력 버튼 조합의 날짜 필드. 직접 타이핑도 허용해야 할 때 사용. */
export function TextDatePicker({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const selected = parseDate(value);
  const inputId = useId();

  return (
    <Popover className="block w-full min-w-0">
      {({ open, toggle, close, panelId }) => (
        <div className="flex w-full min-w-0 flex-col gap-1.5">
          <label htmlFor={inputId} className="text-muted-foreground text-xs">
            {label}
          </label>
          <div className="relative">
            <input
              id={inputId}
              type="text"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder ?? `${label} 입력`}
              className={[
                "border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-primary h-9 w-full min-w-0 rounded-lg border pr-10 pl-3 text-sm leading-5 outline-none",
                open ? "border-primary" : "",
              ].join(" ")}
            />
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={`${label} 달력 열기`}
              onClick={toggle}
              className="text-muted-foreground hover:text-primary focus-visible:border-primary absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md border border-transparent focus-visible:outline-none"
            >
              <CalendarIcon className="size-3.5" />
            </button>
          </div>
          {open && (
            <CalendarPopoverPanel
              panelId={panelId}
              ariaLabel={label}
              selected={selected}
              onSelect={(date) => {
                onChange(formatDate(date));
                close();
              }}
            />
          )}
        </div>
      )}
    </Popover>
  );
}

export function DatePicker({
  value,
  onChange,
  label,
  hideLabel,
  className,
}: DatePickerProps) {
  const selected = parseDate(value);
  const triggerId = useId();

  return (
    <Popover className="block w-full min-w-0">
      {({ open, toggle, close, panelId }) => (
        <div className="flex w-full min-w-0 flex-col gap-1.5">
          {label && (
            <label
              htmlFor={triggerId}
              className={
                hideLabel ? "sr-only" : "text-muted-foreground text-xs"
              }
            >
              {label}
            </label>
          )}
          <button
            id={triggerId}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={`${label ?? "날짜"} 달력 열기`}
            onClick={toggle}
            className={[
              "border-border bg-card text-foreground focus-visible:border-primary flex h-9 w-full min-w-0 items-center gap-2 rounded-lg border px-3 text-left text-sm leading-5 outline-none",
              open ? "border-primary" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <CalendarIcon
              aria-hidden="true"
              className="text-muted-foreground size-3.5 shrink-0"
            />
            <span
              className={[
                "min-w-0 flex-1 truncate leading-5",
                value ? "text-foreground" : "text-muted-foreground",
              ].join(" ")}
            >
              {value || "YYYY-MM-DD"}
            </span>
          </button>
          {open && (
            <CalendarPopoverPanel
              panelId={panelId}
              ariaLabel={label}
              selected={selected}
              onSelect={(date) => {
                onChange(formatDate(date));
                close();
              }}
            />
          )}
        </div>
      )}
    </Popover>
  );
}
