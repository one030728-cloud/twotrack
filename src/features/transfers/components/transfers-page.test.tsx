import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SnackbarProvider } from "@/components/ui/snackbar";
import { TransfersPage } from "./transfers-page";
import { resetTransfersForTest } from "@/mocks/handlers";

function renderPage() {
  return render(
    <SnackbarProvider>
      <TransfersPage />
    </SnackbarProvider>,
  );
}

beforeEach(() => {
  resetTransfersForTest();
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
  resetTransfersForTest();
  vi.restoreAllMocks();
});

describe("TransfersPage", () => {
  it("전환건 목록과 첫 전환건 상세를 표시한다", async () => {
    renderPage();

    expect(await screen.findAllByText("소담족발 마포점")).not.toHaveLength(0);
    expect(screen.getByText("전체 전환건")).toBeInTheDocument();
  });

  it("검색어로 목록을 필터링한다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("소담족발 마포점");

    await user.type(
      screen.getByPlaceholderText("상호명, 대표자, 전화번호 검색"),
      "카페 무이",
    );

    expect(screen.getAllByText("카페 무이").length).toBeGreaterThan(0);
    expect(screen.queryByText("소담족발 마포점")).not.toBeInTheDocument();
  });

  it("전환건 등록 모달에서 새 전환건을 추가한다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("소담족발 마포점");

    await user.click(screen.getByRole("button", { name: "전환건 등록" }));
    const modal = screen.getByRole("dialog", { name: "전환건 등록" });
    await user.type(within(modal).getByLabelText("상호명"), "새 전환건");
    await user.type(within(modal).getByLabelText("대표자명"), "홍길동");
    await user.type(within(modal).getByLabelText("연락처"), "010-0000-0000");
    await user.click(within(modal).getByRole("button", { name: "등록" }));

    expect(await screen.findAllByText("새 전환건")).not.toHaveLength(0);
  });

  it("삭제 버튼을 누르면 확인 후 전환건을 제거한다", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByText("제일곱창 본점"));

    await user.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() =>
      expect(screen.queryByText("제일곱창 본점")).not.toBeInTheDocument(),
    );
  });
});
