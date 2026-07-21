import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SnackbarProvider } from "@/components/ui/snackbar";
import { InstallationsPage } from "./installations-page";
import { resetInstallsForTest } from "@/mocks/handlers";

beforeEach(() => {
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
  vi.restoreAllMocks();
});

describe("InstallationsPage", () => {
  function renderPage() {
    render(
      <SnackbarProvider>
        <InstallationsPage />
      </SnackbarProvider>,
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
});
