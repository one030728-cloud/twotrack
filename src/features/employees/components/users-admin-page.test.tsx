import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UsersAdminPage } from "./users-admin-page";
import { resetEmployeesForTest } from "@/mocks/handlers";

beforeEach(() => {
  resetEmployeesForTest();
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
  resetEmployeesForTest();
  vi.restoreAllMocks();
});

describe("UsersAdminPage", () => {
  it("직원 목록과 직책 배지를 표시한다", async () => {
    render(<UsersAdminPage />);

    expect(await screen.findByText("정지은 매니저")).toBeInTheDocument();
    expect(screen.getByText("CS 매니저")).toBeInTheDocument();
    expect(screen.getByText("마스터")).toBeInTheDocument();
  });

  it("직원 추가 모달에서 새 직원을 등록한다", async () => {
    const user = userEvent.setup();
    render(<UsersAdminPage />);
    await screen.findByText("정지은 매니저");

    await user.click(screen.getByRole("button", { name: "직원 추가" }));
    const modal = screen.getByRole("dialog", { name: "직원 추가" });
    await user.type(within(modal).getByLabelText("이름"), "신규 직원");
    await user.type(within(modal).getByLabelText("팀"), "CS팀");
    await user.click(within(modal).getByRole("button", { name: "추가" }));

    expect(await screen.findByText("신규 직원")).toBeInTheDocument();
  });

  it("권한 변경 모달에서 직책을 바꾸면 목록에 반영된다", async () => {
    const user = userEvent.setup();
    render(<UsersAdminPage />);
    const row = (await screen.findByText("정지은 매니저")).closest(
      "div.grid",
    ) as HTMLElement;

    await user.click(within(row).getByRole("button", { name: "권한 변경" }));
    const modal = screen.getByRole("dialog", {
      name: "정지은 매니저 권한 변경",
    });
    await user.click(within(modal).getByLabelText("CS 매니저"));
    await user.click(within(modal).getByLabelText("CS 책임매니저"));
    await user.click(within(modal).getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(within(row).getByText("CS 책임매니저")).toBeInTheDocument(),
    );
  });

  it("삭제 버튼을 누르면 확인 후 계정을 제거한다", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<UsersAdminPage />);
    const row = (await screen.findByText("조회 전용")).closest(
      "div.grid",
    ) as HTMLElement;

    await user.click(within(row).getByRole("button", { name: "삭제" }));

    await waitFor(() =>
      expect(screen.queryByText("조회 전용")).not.toBeInTheDocument(),
    );
  });

  it("마지막 관리자/마스터 계정은 삭제를 막는다", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<UsersAdminPage />);

    // 초기 시드에는 admin(role=admin)과 master(position=master) 두 명이 있으므로
    // 먼저 admin을 지우면 master가 남아 있어 정상 삭제된다.
    // "관리자"는 계정 이름이자 역할 배지 텍스트이기도 해 이름 요소만 특정해서 찾는다.
    const adminName = await screen.findByText(
      (_, element) =>
        element?.tagName === "DIV" &&
        element.textContent === "관리자" &&
        !!element.className.includes("font-bold"),
    );
    const adminRow = adminName.closest("div.grid") as HTMLElement;
    await user.click(within(adminRow).getByRole("button", { name: "삭제" }));
    await waitFor(() =>
      expect(screen.queryByText("관리자")).not.toBeInTheDocument(),
    );

    // 이제 마지막 남은 최상위 권한(master)을 지우려 하면 막혀야 한다.
    const masterRow = screen
      .getByText("김마스터")
      .closest("div.grid") as HTMLElement;
    await user.click(within(masterRow).getByRole("button", { name: "삭제" }));

    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    expect(screen.getByText("김마스터")).toBeInTheDocument();
  });
});
