import type {
  CalendarEvent,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "@/features/calendar/types";

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const res = await fetch("/api/calendar-events");
  return res.json();
}

export async function createCalendarEvent(
  input: CreateCalendarEventInput,
): Promise<CalendarEvent> {
  const res = await fetch("/api/calendar-events", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function updateCalendarEvent(
  id: string,
  patch: UpdateCalendarEventInput,
): Promise<CalendarEvent> {
  const res = await fetch(`/api/calendar-events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return res.json();
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  await fetch(`/api/calendar-events/${id}`, { method: "DELETE" });
}
