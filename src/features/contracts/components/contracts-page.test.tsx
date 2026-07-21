import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SnackbarProvider } from "@/components/ui/snackbar";
import { ContractsPage } from "./contracts-page";
import { resetContractsForTest } from "@/mocks/handlers";

beforeEach(() => {
  resetContractsForTest();
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
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn() },
  });
});

afterEach(() => {
  resetContractsForTest();
  vi.restoreAllMocks();
});

function renderPage() {
  render(
    <SnackbarProvider>
      <ContractsPage />
    </SnackbarProvider>,
  );
}

describe("ContractsPage", () => {
  it("계약서 목록과 첫 계약서 상세를 표시한다", async () => {
    renderPage();

    expect(await screen.findAllByText("카페 아모르")).not.toHaveLength(0);
    expect(screen.getByText("전체 계약서")).toBeInTheDocument();
  });

  it("계약서 등록 모달에서 새 계약서를 추가한다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("카페 아모르");

    await user.click(screen.getByRole("button", { name: "계약서 등록" }));
    const modal = screen.getByRole("dialog", { name: "계약서 등록" });
    await user.type(within(modal).getByLabelText("상호명"), "새 가맹점");
    await user.type(within(modal).getByLabelText("대표자명"), "홍길동");
    await user.type(within(modal).getByLabelText("연락처"), "010-0000-0000");
    await user.click(within(modal).getByRole("button", { name: "등록" }));

    expect(await screen.findAllByText("새 가맹점")).not.toHaveLength(0);
  });

  it("초안 계약서에서 서명 요청 발송 후 서명대기로 바뀐다", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByText("명동떡볶이 본점"));

    await user.click(screen.getByRole("button", { name: "서명 요청 발송" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "서명완료 처리" }),
      ).toBeInTheDocument(),
    );
  });

  it("삭제 버튼을 누르면 확인 후 계약서를 제거한다", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByText("포레스트 키친"));

    await user.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() =>
      expect(screen.queryByText("포레스트 키친")).not.toBeInTheDocument(),
    );
  });
});
