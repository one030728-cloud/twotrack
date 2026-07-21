import { afterEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationsPopover } from "./notifications-popover";
import { resetNotificationsForTest } from "@/mocks/handlers";

afterEach(() => resetNotificationsForTest());

describe("NotificationsPopover", () => {
  it("안읽은 알림 개수가 벨 배지에 표시된다", async () => {
    render(<NotificationsPopover />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "알림, 읽지 않은 알림 5개" }),
      ).toBeInTheDocument(),
    );
  });

  it("벨을 클릭하면 알림 목록이 열린다", async () => {
    const user = userEvent.setup();
    render(<NotificationsPopover />);

    const bell = await screen.findByRole("button", {
      name: "알림, 읽지 않은 알림 5개",
    });
    await user.click(bell);

    expect(
      await screen.findByText("카페 아모르 서류 미제출 안내가 발송되었습니다."),
    ).toBeInTheDocument();
  });

  it("항목 클릭 시 읽음 처리되어 안읽은 개수가 줄어들고 패널이 닫힌다", async () => {
    const user = userEvent.setup();
    render(<NotificationsPopover />);

    const bell = await screen.findByRole("button", {
      name: "알림, 읽지 않은 알림 5개",
    });
    await user.click(bell);

    const item = await screen.findByText(
      "카페 아모르 서류 미제출 안내가 발송되었습니다.",
    );
    await user.click(item);

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "알림, 읽지 않은 알림 4개" }),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("모두 읽음으로 표시를 클릭하면 배지가 사라진다", async () => {
    const user = userEvent.setup();
    render(<NotificationsPopover />);

    const bell = await screen.findByRole("button", {
      name: "알림, 읽지 않은 알림 5개",
    });
    await user.click(bell);
    await user.click(
      screen.getByRole("button", { name: "모두 읽음으로 표시" }),
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "알림" })).toBeInTheDocument(),
    );
  });
});
