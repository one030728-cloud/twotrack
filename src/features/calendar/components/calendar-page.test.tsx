import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarPage } from "./calendar-page";
import { resetCalendarEventsForTest } from "@/mocks/handlers";

beforeEach(() => {
  resetCalendarEventsForTest();
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
});

afterEach(() => {
  resetCalendarEventsForTest();
  vi.restoreAllMocks();
});

describe("CalendarPage", () => {
  it("페이지 제목과 캘린더를 표시한다", async () => {
    render(<CalendarPage />);

    expect(screen.getByText("캘린더")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("불러오는 중입니다.")).not.toBeInTheDocument(),
    );
  });

  it("일정 추가 모달에서 새 일정을 등록하면 해당 날짜 목록에 반영된다", async () => {
    const user = userEvent.setup();
    render(<CalendarPage />);
    await waitFor(() =>
      expect(screen.queryByText("불러오는 중입니다.")).not.toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "일정 추가" }));
    const modal = screen.getByRole("dialog", { name: "일정 추가" });
    await user.type(within(modal).getByLabelText("제목"), "새 일정");
    const dateInput = within(modal).getByLabelText("날짜");
    await user.clear(dateInput);
    await user.type(dateInput, "2026-07-21");
    await user.click(within(modal).getByRole("button", { name: "추가" }));

    expect(await screen.findByText("새 일정")).toBeInTheDocument();
  });
});
