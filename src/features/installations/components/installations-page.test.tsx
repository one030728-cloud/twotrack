import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SnackbarProvider } from "@/components/ui/snackbar";
import { InstallationsPage } from "./installations-page";
import { resetInstallsForTest, resetWorkflowsForTest } from "@/mocks/handlers";
import { AuthProvider } from "@/features/auth/auth-provider";

beforeEach(() => {
  resetInstallsForTest();
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
  resetInstallsForTest();
  resetWorkflowsForTest();
  vi.restoreAllMocks();
});

describe("InstallationsPage", () => {
  function renderPage() {
    render(
      <AuthProvider>
        <SnackbarProvider>
          <InstallationsPage />
        </SnackbarProvider>
      </AuthProvider>,
    );
  }

  it("신규 등록 Modal에서 제품/담당기사/희망 시간대 dropdown을 표시한다", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "설치 등록" }));

    const modal = screen.getByRole("dialog", { name: "설치관리 신규 등록" });
    expect(within(modal).getByLabelText("제품")).toBeInTheDocument();
    expect(within(modal).getByLabelText("담당기사")).toBeInTheDocument();
    expect(within(modal).getByLabelText("희망 시간대")).toBeInTheDocument();
  });

  it("상세 Drawer에서 상태/제품/담당기사/희망 시간대 dropdown을 표시한다", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByText("카페 아모르"));

    const drawer = screen.getByRole("dialog", { name: "카페 아모르" });
    expect(within(drawer).getByLabelText("상태")).toBeInTheDocument();
    expect(within(drawer).getByLabelText("제품")).toBeInTheDocument();
    expect(within(drawer).getByLabelText("담당기사")).toBeInTheDocument();
    expect(within(drawer).getByLabelText("희망 시간대")).toBeInTheDocument();
  });

  it("완료 처리 요청을 제출하면 즉시 완료되지 않고 승인 대기 상태가 된다", async () => {
    window.localStorage.setItem("posmos-auth-user", "tech-manager");
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByText("카페 아모르"));
    const drawer = screen.getByRole("dialog", { name: "카페 아모르" });

    await user.click(
      within(drawer).getByRole("button", { name: "완료 처리 요청" }),
    );
    const modal = screen.getByRole("dialog", { name: "작업 완료 처리" });
    await user.type(
      within(modal).getByLabelText("사진 없음 사유"),
      "현장 사진 미첨부",
    );
    await user.type(
      within(modal).getByLabelText("결과 메모"),
      "정상적으로 설치를 완료했습니다.",
    );
    await user.click(
      within(modal).getByRole("button", { name: "완료 처리 요청" }),
    );

    expect(
      await within(drawer).findByText(
        (_, element) =>
          element?.tagName.toLowerCase() === "li" &&
          !!element.textContent?.includes("박기사 매니저") &&
          !!element.textContent?.includes("완료요청"),
      ),
    ).toBeInTheDocument();
    expect(within(drawer).queryByText("완료 처리됨")).not.toBeInTheDocument();
  });
});
