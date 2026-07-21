export type CalendarEventType = "install" | "meeting" | "deadline" | "etc";

export const CALENDAR_EVENT_TYPE_META: Record<
  CalendarEventType,
  { label: string }
> = {
  install: { label: "설치" },
  meeting: { label: "미팅" },
  deadline: { label: "마감" },
  etc: { label: "기타" },
};

export const CALENDAR_EVENT_TYPE_ORDER: CalendarEventType[] = [
  "install",
  "meeting",
  "deadline",
  "etc",
];

export interface CalendarEvent {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  type: CalendarEventType;
  memo: string;
}

export type CreateCalendarEventInput = Pick<CalendarEvent, "title" | "date"> &
  Partial<Omit<CalendarEvent, "id" | "title" | "date">>;

export type UpdateCalendarEventInput = Partial<Omit<CalendarEvent, "id">>;
