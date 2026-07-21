import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useNotifications } from "./use-notifications";
import { resetNotificationsForTest } from "@/mocks/handlers";

beforeEach(() => resetNotificationsForTest());
afterEach(() => resetNotificationsForTest());

describe("useNotifications", () => {
  it("목록을 불러오고 안읽은 개수를 계산한다", async () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.notifications).toHaveLength(6);
    expect(result.current.unreadCount).toBe(5);
  });

  it("markRead 호출 시 해당 항목만 읽음 처리되고 안읽은 개수가 줄어든다", async () => {
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.markRead("1");
    });

    await waitFor(() => {
      const target = result.current.notifications.find((n) => n.id === "1");
      expect(target?.read).toBe(true);
    });
    expect(result.current.unreadCount).toBe(4);
  });

  it("markAllRead 호출 시 모든 항목이 읽음 처리된다", async () => {
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.markAllRead();
    });

    await waitFor(() => expect(result.current.unreadCount).toBe(0));
  });
});
