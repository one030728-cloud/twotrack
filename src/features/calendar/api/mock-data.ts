import type { CalendarEvent } from "@/features/calendar/types";

/** 실제 서비스 초기 상태. 데모용 목데이터 없이 빈 목록에서 시작한다. */
export function createInitialCalendarEvents(): CalendarEvent[] {
  return [];
}

/** 테스트 전용 목업 픽스처. 실제 앱 초기 데이터로는 사용하지 않는다. */
export function createFixtureCalendarEvents(): CalendarEvent[] {
  return [
    {
      id: "event-1",
      title: "카페 아모르 설치",
      date: "2026-07-16",
      type: "install",
      memo: "오전 방문 예정",
    },
    {
      id: "event-2",
      title: "가맹점 계약 미팅",
      date: "2026-07-21",
      type: "meeting",
      memo: "포레스트 키친",
    },
    {
      id: "event-3",
      title: "서류 제출 마감",
      date: "2026-07-24",
      type: "deadline",
      memo: "",
    },
  ];
}
