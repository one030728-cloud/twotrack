import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SnackbarProvider } from "@/components/ui/snackbar";
import { MerchantsPage } from "./merchants-page";
import { resetMerchantsForTest } from "@/mocks/handlers";

function renderPage() {
  return render(
    <SnackbarProvider>
      <MerchantsPage />
    </SnackbarProvider>,
  );
}

beforeEach(() => {
  resetMerchantsForTest();
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
  resetMerchantsForTest();
  vi.restoreAllMocks();
});

describe("MerchantsPage", () => {
  it("가맹점 목록과 첫 가맹점 상세를 표시한다", async () => {
    renderPage();

    expect(await screen.findAllByText("카페 아모르")).not.toHaveLength(0);
    expect(screen.getByText("전체 가맹점")).toBeInTheDocument();
  });

  it("검색어로 목록을 필터링한다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("카페 아모르");

    await user.type(
      screen.getByPlaceholderText("상호명, 대표자, 전화번호 검색"),
      "명동떡볶이",
    );

    expect(screen.getAllByText("명동떡볶이 본점").length).toBeGreaterThan(0);
    expect(screen.queryByText("카페 아모르")).not.toBeInTheDocument();
  });

  it("가맹점 등록 모달에서 새 가맹점을 추가한다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("카페 아모르");

    await user.click(screen.getByRole("button", { name: "가맹점 등록" }));
    const modal = screen.getByRole("dialog", { name: "가맹점 등록" });
    await user.type(within(modal).getByLabelText("상호명"), "새 가맹점");
    await user.type(within(modal).getByLabelText("대표자명"), "홍길동");
    await user.type(within(modal).getByLabelText("연락처"), "010-0000-0000");
    await user.click(within(modal).getByRole("button", { name: "등록" }));

    expect(await screen.findAllByText("새 가맹점")).not.toHaveLength(0);
  });

  it("삭제 버튼을 누르면 확인 후 가맹점을 제거한다", async () => {
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
