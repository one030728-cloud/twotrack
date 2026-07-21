import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SnackbarProvider } from "@/components/ui/snackbar";
import { BlueprintsPage } from "./blueprints-page";
import { resetInstallsForTest, resetWorkflowsForTest } from "@/mocks/handlers";
import { AuthProvider } from "@/features/auth/auth-provider";

// 실제 서비스는 빈 목록에서 시작하므로, 이 페이지의 매장 도면 표시를 검증하기 위해
// 테스트에서만 STORE_MOCKS 자리에 목업 픽스처를 주입한다.
vi.mock("@/features/stores/api/mock-data", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/features/stores/api/mock-data")>();
  return { ...actual, STORE_MOCKS: actual.STORE_FIXTURES };
});

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

function renderPage() {
  render(
    <AuthProvider>
      <SnackbarProvider>
        <BlueprintsPage />
      </SnackbarProvider>
    </AuthProvider>,
  );
}

describe("BlueprintsPage", () => {
  it("설치건과 매장의 도면을 함께 표시한다", async () => {
    renderPage();

    expect(
      await screen.findAllByText("카페아모르_카운터도면.pdf"),
    ).toHaveLength(2);
    expect(screen.getAllByText("설치 관리").length).toBeGreaterThan(0);
    expect(screen.getAllByText("매장 운영 이력").length).toBeGreaterThan(0);
  });

  it("설치건 도면 카드를 클릭하면 해당 설치건 상세가 열린다", async () => {
    const user = userEvent.setup();
    renderPage();
    const [installCard] =
      await screen.findAllByText("카페아모르_카운터도면.pdf");
    await user.click(installCard);

    expect(
      screen.getByRole("dialog", { name: "카페 아모르" }),
    ).toBeInTheDocument();
  });

  it("검색어로 도면 목록을 필터링한다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("카페아모르_카운터도면.pdf");

    await user.type(
      screen.getByPlaceholderText("상호명, 파일명 검색"),
      "존재하지않는상호",
    );

    expect(
      screen.getByText("조건에 맞는 설계도가 없습니다."),
    ).toBeInTheDocument();
  });
});
