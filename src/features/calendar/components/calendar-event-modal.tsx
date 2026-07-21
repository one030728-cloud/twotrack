"use client";

import { useId, useState } from "react";
import { XIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CALENDAR_EVENT_TYPE_META,
  CALENDAR_EVENT_TYPE_ORDER,
  type CalendarEvent,
  type CalendarEventType,
} from "@/features/calendar/types";

const TYPE_OPTIONS = CALENDAR_EVENT_TYPE_ORDER.map((type) => ({
  value: type,
  label: CALENDAR_EVENT_TYPE_META[type].label,
}));

export interface CalendarEventFormValue {
  title: string;
  date: string;
  type: CalendarEventType;
  memo: string;
}

interface CalendarEventModalProps {
  title: string;
  submitLabel: string;
  initial?: CalendarEvent;
  defaultDate?: string;
  onClose: () => void;
  onSubmit: (value: CalendarEventFormValue) => void;
}

export function CalendarEventModal({
  title,
  submitLabel,
  initial,
  defaultDate,
  onClose,
  onSubmit,
}: CalendarEventModalProps) {
  const titleId = useId();
  const [eventTitle, setEventTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? "");
  const [type, setType] = useState<CalendarEventType>(initial?.type ?? "etc");
  const [memo, setMemo] = useState(initial?.memo ?? "");

  const canSubmit = eventTitle.trim() && date.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      title: eventTitle.trim(),
      date: date.trim(),
      type,
      memo: memo.trim(),
    });
  };

  return (
    <Dialog open onClose={onClose} labelledBy={titleId} className="w-[420px]">
      <div className="border-border flex items-center justify-between border-b px-6 py-5">
        <div id={titleId} className="text-foreground text-lg font-bold">
          {title}
        </div>
        <Button variant="ghost" size="icon" aria-label="닫기" onClick={onClose}>
          <XIcon className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-4 px-6 py-5">
        <Input
          label="제목"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
        />
        <Input
          label="날짜"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Select
          label="유형"
          value={type}
          onValueChange={(value) => setType(value as CalendarEventType)}
          options={TYPE_OPTIONS}
        />
        <Textarea
          label="메모"
          rows={3}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      <div className="border-border flex justify-end gap-2 border-t px-6 py-4">
        <Button onClick={onClose}>취소</Button>
        <Button variant="primary" disabled={!canSubmit} onClick={handleSubmit}>
          {submitLabel}
        </Button>
      </div>
    </Dialog>
  );
}
