import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "./format-relative-time";

describe("formatRelativeTime", () => {
  const now = new Date("2026-07-14T10:00:00+09:00");

  it("1분 미만이면 방금 전", () => {
    expect(formatRelativeTime("2026-07-14T09:59:30+09:00", now)).toBe(
      "방금 전",
    );
  });

  it("분 단위 경과를 표시한다", () => {
    expect(formatRelativeTime("2026-07-14T09:45:00+09:00", now)).toBe(
      "15분 전",
    );
  });

  it("시간 단위 경과를 표시한다", () => {
    expect(formatRelativeTime("2026-07-14T07:00:00+09:00", now)).toBe(
      "3시간 전",
    );
  });

  it("일 단위 경과를 표시한다", () => {
    expect(formatRelativeTime("2026-07-11T10:00:00+09:00", now)).toBe("3일 전");
  });
});
