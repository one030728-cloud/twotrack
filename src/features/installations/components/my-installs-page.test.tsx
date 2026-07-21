import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SnackbarProvider } from "@/components/ui/snackbar";
import { MyInstallsPage } from "./my-installs-page";
import { resetInstallsForTest, resetWorkflowsForTest } from "@/mocks/handlers";
import { AUTH_STORAGE_KEY, AuthProvider } from "@/features/auth/auth-provider";

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
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  vi.restoreAllMocks();
});

function renderPage() {
  render(
    <AuthProvider>
      <SnackbarProvider>
        <MyInstallsPage />
      </SnackbarProvider>
    </AuthProvider>,
  );
}

describe("MyInstallsPage", () => {
  it("담당기사로 매칭되지 않는 계정은 안내 문구를 본다", async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "admin");
    renderPage();

    expect(
      await screen.findByText(
        "담당기사로 등록된 계정에서만 사용할 수 있습니다.",
      ),
    ).toBeInTheDocument();
  });

  it("담당기사 계정은 본인이 담당한 건만 표시한다", async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "tech-manager");
    renderPage();

    expect(await screen.findByText("카페 아모르")).toBeInTheDocument();
    expect(screen.queryByText("명동떡볶이 본점")).not.toBeInTheDocument();
  });
});
