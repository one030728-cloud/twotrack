import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SnackbarProvider } from "@/components/ui/snackbar";
import { ExternalTechsPage } from "./external-techs-page";
import { resetExternalTechsForTest } from "@/mocks/handlers";

function renderPage() {
  return render(
    <SnackbarProvider>
      <ExternalTechsPage />
    </SnackbarProvider>,
  );
}

beforeEach(() => {
  resetExternalTechsForTest();
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
  resetExternalTechsForTest();
  vi.restoreAllMocks();
});

describe("ExternalTechsPage", () => {
  it("외부 기사 목록과 첫 기사 상세를 표시한다", async () => {
    renderPage();

    expect(await screen.findAllByText("김승우")).not.toHaveLength(0);
    expect(screen.getByText("전체 외부 기사")).toBeInTheDocument();
  });

  it("검색어로 목록을 필터링한다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("김승우");

    await user.type(
      screen.getByPlaceholderText("이름, 소속업체, 활동지역 검색"),
      "이도훈",
    );

    expect(screen.getAllByText("이도훈").length).toBeGreaterThan(0);
    expect(screen.queryByText("김승우")).not.toBeInTheDocument();
  });

  it("외부 기사 등록 모달에서 새 기사를 추가한다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("김승우");

    await user.click(screen.getByRole("button", { name: "외부 기사 등록" }));
    const modal = screen.getByRole("dialog", { name: "외부 기사 등록" });
    await user.type(within(modal).getByLabelText("이름"), "새 기사");
    await user.type(within(modal).getByLabelText("연락처"), "010-0000-0000");
    await user.click(within(modal).getByRole("button", { name: "등록" }));

    expect(await screen.findAllByText("새 기사")).not.toHaveLength(0);
  });

  it("삭제 버튼을 누르면 확인 후 외부 기사를 제거한다", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByText("박세진"));

    await user.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() =>
      expect(screen.queryByText("박세진")).not.toBeInTheDocument(),
    );
  });
});
