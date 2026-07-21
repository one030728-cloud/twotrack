import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCalendar } from "./use-calendar";
import { resetCalendarEventsForTest } from "@/mocks/handlers";

beforeEach(() => resetCalendarEventsForTest());
afterEach(() => resetCalendarEventsForTest());

async function setupLoaded() {
  const { result } = renderHook(() => useCalendar());
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
}

describe("useCalendar", () => {
  it("초기 일정 3건을 불러온다", async () => {
    const result = await setupLoaded();
    expect(result.current.events).toHaveLength(3);
  });

  it("addEvent는 새 일정을 추가한다", async () => {
    const result = await setupLoaded();

    await act(async () => {
      await result.current.addEvent({
        title: "새 일정",
        date: "2026-08-01",
      });
    });

    expect(result.current.events).toHaveLength(4);
    const created = result.current.events.find((e) => e.title === "새 일정");
    expect(created?.type).toBe("etc");
  });

  it("editEvent는 일정 내용을 변경한다", async () => {
    const result = await setupLoaded();
    const target = result.current.events[0];

    await act(async () => {
      await result.current.editEvent(target.id, { title: "변경된 제목" });
    });

    const updated = result.current.events.find((e) => e.id === target.id);
    expect(updated?.title).toBe("변경된 제목");
  });

  it("removeEvent는 일정을 삭제한다", async () => {
    const result = await setupLoaded();
    const target = result.current.events[0];

    await act(async () => {
      await result.current.removeEvent(target.id);
    });

    expect(result.current.events.some((e) => e.id === target.id)).toBe(false);
  });
});
