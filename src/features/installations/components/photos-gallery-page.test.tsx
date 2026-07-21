import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SnackbarProvider } from "@/components/ui/snackbar";
import { PhotosGalleryPage } from "./photos-gallery-page";
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

function renderPage() {
  render(
    <AuthProvider>
      <SnackbarProvider>
        <PhotosGalleryPage />
      </SnackbarProvider>
    </AuthProvider>,
  );
}

describe("PhotosGalleryPage", () => {
  it("완료사진이 등록된 설치건을 카드로 표시한다", async () => {
    renderPage();

    expect(
      await screen.findByText("명동떡볶이_완료사진.jpg"),
    ).toBeInTheDocument();
  });

  it("검색어로 완료사진 목록을 필터링한다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("명동떡볶이_완료사진.jpg");

    await user.type(
      screen.getByPlaceholderText("고객명, 파일명 검색"),
      "존재하지않는고객",
    );

    expect(
      screen.getByText("조건에 맞는 완료사진이 없습니다."),
    ).toBeInTheDocument();
  });

  it("카드를 클릭하면 해당 설치건 상세가 열린다", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByText("명동떡볶이_완료사진.jpg"));

    expect(
      screen.getByRole("dialog", { name: "명동떡볶이 본점" }),
    ).toBeInTheDocument();
  });
});
