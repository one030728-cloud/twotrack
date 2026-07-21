import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SnackbarProvider } from "@/components/ui/snackbar";
import { FranchiseReceiptsPage } from "./franchise-receipts-page";
import { resetInstallsForTest, resetReceiptsForTest } from "@/mocks/handlers";

// jsdom은 HTMLDialogElement의 showModal/close를 구현하지 않으므로
// 모달/드로어가 뜨는 테스트를 위해 최소 폴리필을 등록한다.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-07-17T12:00:00+09:00"));

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
  resetReceiptsForTest();
  resetInstallsForTest();
  vi.useRealTimers();
});

describe("FranchiseReceiptsPage", () => {
  function renderPage() {
    render(
      <SnackbarProvider>
        <FranchiseReceiptsPage />
      </SnackbarProvider>,
    );
  }

  it("제목과 설명을 표시하고, 신규 접수 클릭 시 등록 모달이 열린다", async () => {
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByText("가맹 접수 관리")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /신규 접수/ }));
    const modal = screen.getByRole("dialog", { name: "프랜차이즈 정보 입력" });
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByLabelText("접수채널")).toBeInTheDocument();
    expect(within(modal).getByLabelText("사업자 유형")).toBeInTheDocument();
    expect(within(modal).getByLabelText("인터넷")).toBeInTheDocument();
    expect(within(modal).queryByLabelText("등록자")).not.toBeInTheDocument();
    expect(within(modal).getByLabelText("담당자")).toBeInTheDocument();
    expect(within(modal).getByLabelText("상품")).toBeInTheDocument();
  });

  it("상호명 클릭 시 상세 드로어가 열린다", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByText("카페 아모르"));

    const drawer = screen.getByRole("dialog", { name: "카페 아모르" });
    expect(
      within(drawer).getByText("VAN사 (중복선택 가능)"),
    ).toBeInTheDocument();
    expect(within(drawer).getByLabelText("접수채널")).toBeInTheDocument();
    expect(within(drawer).getByLabelText("사업자 유형")).toBeInTheDocument();
    expect(within(drawer).getByText("등록자")).toBeInTheDocument();
    expect(within(drawer).queryByLabelText("등록자")).not.toBeInTheDocument();
    expect(within(drawer).getByLabelText("담당자")).toBeInTheDocument();
    expect(within(drawer).getByLabelText("상품")).toBeInTheDocument();
  });

  it("상세 드로어에서 기술지원 이관을 실행하면 이관 완료 상태로 바뀐다", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByText("카페 아모르"));

    const drawer = screen.getByRole("dialog", { name: "카페 아모르" });
    await user.click(
      within(drawer).getByRole("button", { name: "기술지원 이관" }),
    );

    expect(
      await within(drawer).findByRole("button", { name: "이관 완료" }),
    ).toBeDisabled();
  });

  it("로딩 후 KPI와 목록을 표시한다", async () => {
    renderPage();
    expect(await screen.findByText("카페 아모르")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /오늘 접수 3건/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /오늘 완료 1건/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("전체 18건")).toBeInTheDocument();
  });

  it("탭을 클릭하면 목록이 필터링된다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("카페 아모르");

    await user.click(screen.getByRole("tab", { name: /서류 미비/ }));

    expect(screen.getByText(/전체 \d+건/)).toBeInTheDocument();
    expect(screen.queryByText("카페 아모르")).not.toBeInTheDocument();
  });

  it("검색어를 입력하면 목록이 필터링된다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("카페 아모르");

    await user.type(
      screen.getByPlaceholderText(
        "상호명, 대표자, 연락처, 사업자번호 통합 검색",
      ),
      "카페 아모르",
    );

    expect(await screen.findByText("전체 1건")).toBeInTheDocument();
  });

  it("KPI 클릭 시 연결된 탭과 필터를 적용하고 기존 검색을 초기화한다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("카페 아모르");

    const search = screen.getByPlaceholderText(
      "상호명, 대표자, 연락처, 사업자번호 통합 검색",
    );
    await user.type(search, "카페 아모르");
    await user.click(screen.getByRole("button", { name: /서류 미비 \d+건/ }));

    expect(search).toHaveValue("");
    expect(screen.getByRole("tab", { name: /서류 미비/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
