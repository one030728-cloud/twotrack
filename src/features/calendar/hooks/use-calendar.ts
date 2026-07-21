"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  fetchCalendarEvents,
  updateCalendarEvent,
} from "@/features/calendar/api/calendar-api";
import type {
  CalendarEvent,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "@/features/calendar/types";

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCalendarEvents().then((data) => {
      if (cancelled) return;
      setEvents(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addEvent = useCallback(async (input: CreateCalendarEventInput) => {
    const created = await createCalendarEvent(input);
    setEvents((prev) => [...prev, created]);
    return created;
  }, []);

  const editEvent = useCallback(
    async (id: string, patch: UpdateCalendarEventInput) => {
      const updated = await updateCalendarEvent(id, patch);
      setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
      return updated;
    },
    [],
  );

  const removeEvent = useCallback(async (id: string) => {
    await deleteCalendarEvent(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return {
    loading,
    events,
    addEvent,
    editEvent,
    removeEvent,
  };
}
