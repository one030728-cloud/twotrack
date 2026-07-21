import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UsersAdminPage } from "./users-admin-page";
import { resetEmployeesForTest } from "@/mocks/handlers";
import { AuthProvider } from "@/features/auth/auth-provider";

function renderPage() {
  return render(
    <AuthProvider>
      <UsersAdminPage />
    </AuthProvider>,
  );
}

beforeEach(() => {
  resetEmployeesForTest();
  window.localStorage.setItem("posmos-auth-user", "master");
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
  window.localStorage.removeItem("posmos-auth-user");
  vi.restoreAllMocks();
});

describe("UsersAdminPage", () => {
  it("직원 목록과 직책 배지를 표시한다", async () => {
    renderPage();

    expect(await screen.findByText("정지은 매니저")).toBeInTheDocument();
    expect(screen.getByText("CS 매니저")).toBeInTheDocument();
    expect(screen.getByText("마스터")).toBeInTheDocument();
  });

  it("직원 추가 모달에서 새 직원을 등록한다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("정지은 매니저");

    await user.click(screen.getByRole("button", { name: "직원 추가" }));
    const modal = screen.getByRole("dialog", { name: "직원 추가" });
    await user.type(within(modal).getByLabelText("이름"), "신규 직원");
    await user.click(within(modal).getByRole("combobox", { name: "팀" }));
    await user.click(await screen.findByRole("option", { name: "CS" }));
    await user.click(within(modal).getByRole("button", { name: "추가" }));

    expect(await screen.findByText("신규 직원")).toBeInTheDocument();
  });

  it("개발팀을 선택하면 마스터 직책이 자동으로 부여되고 해제할 수 없다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("정지은 매니저");

    await user.click(screen.getByRole("button", { name: "직원 추가" }));
    const modal = screen.getByRole("dialog", { name: "직원 추가" });
    await user.type(within(modal).getByLabelText("이름"), "개발자");
    await user.click(within(modal).getByRole("combobox", { name: "팀" }));
    await user.click(await screen.findByRole("option", { name: "개발팀" }));

    const masterCheckbox = within(modal).getByLabelText("마스터");
    expect(masterCheckbox).toBeChecked();
    expect(masterCheckbox).toBeDisabled();

    await user.click(within(modal).getByRole("button", { name: "추가" }));
    expect(await screen.findByText("개발자")).toBeInTheDocument();
  });

  it("권한 변경 모달에서 직책을 바꾸면 목록에 반영된다", async () => {
    const user = userEvent.setup();
    renderPage();
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
    renderPage();
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
    renderPage();

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

  it("마스터 계정은 직원 추가 시 아이디·비밀번호를 부여할 수 있다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("정지은 매니저");

    await user.click(screen.getByRole("button", { name: "직원 추가" }));
    const modal = screen.getByRole("dialog", { name: "직원 추가" });
    await user.type(within(modal).getByLabelText("이름"), "신규 계정");
    await user.type(within(modal).getByLabelText("아이디"), "new-account");
    await user.type(within(modal).getByLabelText("비밀번호"), "pass1234");
    await user.click(within(modal).getByRole("combobox", { name: "팀" }));
    await user.click(await screen.findByRole("option", { name: "CS" }));
    await user.click(within(modal).getByRole("button", { name: "추가" }));

    const row = (await screen.findByText("신규 계정")).closest(
      "div.grid",
    ) as HTMLElement;
    expect(within(row).getByText(/new-account/)).toBeInTheDocument();
  });

  it("아이디만 입력하고 비밀번호를 비워두면 추가할 수 없다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("정지은 매니저");

    await user.click(screen.getByRole("button", { name: "직원 추가" }));
    const modal = screen.getByRole("dialog", { name: "직원 추가" });
    await user.type(within(modal).getByLabelText("이름"), "빈비번 계정");
    await user.type(within(modal).getByLabelText("아이디"), "no-password");
    await user.click(within(modal).getByRole("combobox", { name: "팀" }));
    await user.click(await screen.findByRole("option", { name: "CS" }));

    expect(within(modal).getByRole("button", { name: "추가" })).toBeDisabled();
    expect(
      within(modal).getByText(
        "아이디를 입력하면 비밀번호도 함께 입력해야 합니다.",
      ),
    ).toBeInTheDocument();
  });

  it("마스터가 아니면 아이디·비밀번호 입력란이 보이지 않는다", async () => {
    window.localStorage.setItem("posmos-auth-user", "cs-manager");
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("정지은 매니저");

    await user.click(screen.getByRole("button", { name: "직원 추가" }));
    const modal = screen.getByRole("dialog", { name: "직원 추가" });
    expect(within(modal).queryByLabelText("아이디")).not.toBeInTheDocument();
    expect(within(modal).queryByLabelText("비밀번호")).not.toBeInTheDocument();
  });
});
