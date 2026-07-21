"use client";

import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { ko } from "react-day-picker/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { formatDate, parseDate } from "@/components/ui/date-picker";
import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import {
  CALENDAR_EVENT_TYPE_META,
  type CalendarEvent,
  type CalendarEventType,
} from "@/features/calendar/types";
import {
  CalendarEventModal,
  type CalendarEventFormValue,
} from "@/features/calendar/components/calendar-event-modal";

const TYPE_BADGE_TONE: Record<
  CalendarEventType,
  "primary" | "neutral" | "error"
> = {
  install: "primary",
  meeting: "neutral",
  deadline: "error",
  etc: "neutral",
};

const MONTH_CALENDAR_CLASSNAMES = {
  months: "flex flex-col gap-2 w-full",
  month: "space-y-2 w-full",
  month_caption:
    "flex items-center justify-center py-1 text-sm font-semibold text-foreground",
  nav: "flex items-center justify-between absolute inset-x-1 top-1",
  button_previous:
    "text-muted-foreground hover:bg-muted flex size-8 items-center justify-center rounded-md [&_svg]:size-4",
  button_next:
    "text-muted-foreground hover:bg-muted flex size-8 items-center justify-center rounded-md [&_svg]:size-4",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday:
    "text-muted-foreground w-full flex-1 text-center text-xs font-medium first:text-red-500 last:text-blue-500",
  week: "flex w-full mt-1",
  day: "flex-1 p-0.5 text-center text-sm first:[&_button]:text-red-500 last:[&_button]:text-blue-500",
  day_button:
    "aspect-square w-full rounded-md text-sm text-foreground hover:bg-muted flex items-center justify-center",
  today: "[&_button]:!text-primary [&_button]:font-bold",
  selected:
    "[&_button]:!bg-primary [&_button]:!text-primary-foreground [&_button]:hover:!bg-primary",
  outside: "[&_button]:!text-muted-foreground/50",
  disabled: "[&_button]:!text-muted-foreground/30",
};

const HAS_EVENT_CLASSNAME =
  "relative [&_button]:after:content-[''] [&_button]:after:absolute [&_button]:after:bottom-1 [&_button]:after:left-1/2 [&_button]:after:size-1 [&_button]:after:-translate-x-1/2 [&_button]:after:rounded-full [&_button]:after:bg-primary";

function todayIso(): string {
  return formatDate(new Date());
}

export function CalendarPage() {
  const { loading, events, addEvent, editEvent, removeEvent } = useCalendar();
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CalendarEvent | null>(null);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return map;
  }, [events]);

  const eventDates = useMemo(
    () =>
      [...eventsByDate.keys()]
        .map((date) => parseDate(date))
        .filter((date): date is Date => Boolean(date)),
    [eventsByDate],
  );

  const selectedEvents = eventsByDate.get(selectedDate) ?? [];

  const handleAdd = async (value: CalendarEventFormValue) => {
    await addEvent(value);
    setAddOpen(false);
  };

  const handleEdit = async (value: CalendarEventFormValue) => {
    if (!editTarget) return;
    await editEvent(editTarget.id, value);
    setEditTarget(null);
  };

  const handleDelete = (event: CalendarEvent) => {
    if (!window.confirm(`"${event.title}" 일정을 삭제하시겠습니까?`)) return;
    removeEvent(event.id);
  };

  return (
    <PageShell className="gap-4 pb-10">
      <PageHeader
        title="캘린더"
        description="설치·미팅·마감 등 일정을 날짜별로 관리합니다."
        actions={
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <PlusIcon className="size-3.5" />
            일정 추가
          </Button>
        }
      />

      <div className="grid min-h-0 gap-5 xl:grid-cols-[1fr_360px]">
        <div className="border-border bg-card rounded-lg border p-4">
          <DayPicker
            mode="single"
            locale={ko}
            month={month}
            onMonthChange={setMonth}
            selected={parseDate(selectedDate)}
            onSelect={(date) => {
              if (!date) return;
              setSelectedDate(formatDate(date));
            }}
            modifiers={{ hasEvent: eventDates }}
            modifiersClassNames={{ hasEvent: HAS_EVENT_CLASSNAME }}
            classNames={MONTH_CALENDAR_CLASSNAMES}
          />
        </div>

        <aside className="min-w-0">
          <div className="border-border bg-card overflow-hidden rounded-lg border">
            <div className="border-border border-b px-4 py-3">
              <div className="text-foreground text-sm font-bold">
                {selectedDate}
              </div>
              <div className="text-muted-foreground mt-0.5 text-xs">
                {selectedEvents.length}건의 일정
              </div>
            </div>
            <div className="max-h-[520px] overflow-y-auto">
              {loading ? (
                <div className="text-muted-foreground px-4 py-10 text-center text-sm">
                  불러오는 중입니다.
                </div>
              ) : selectedEvents.length === 0 ? (
                <div className="text-muted-foreground px-4 py-10 text-center text-sm">
                  등록된 일정이 없습니다.
                </div>
              ) : (
                selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border-border border-b px-4 py-3 last:border-b-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-foreground truncate text-sm font-bold">
                          {event.title}
                        </div>
                        {event.memo && (
                          <div className="text-muted-foreground mt-1 text-xs">
                            {event.memo}
                          </div>
                        )}
                      </div>
                      <Badge
                        tone={TYPE_BADGE_TONE[event.type]}
                        className="shrink-0"
                      >
                        {CALENDAR_EVENT_TYPE_META[event.type].label}
                      </Badge>
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditTarget(event)}
                      >
                        수정
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(event)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      {addOpen && (
        <CalendarEventModal
          title="일정 추가"
          submitLabel="추가"
          defaultDate={selectedDate}
          onClose={() => setAddOpen(false)}
          onSubmit={handleAdd}
        />
      )}

      {editTarget && (
        <CalendarEventModal
          title="일정 수정"
          submitLabel="저장"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEdit}
        />
      )}
    </PageShell>
  );
}
