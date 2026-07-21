import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InventoryPage } from "./inventory-page";
import { resetInventoryForTest } from "@/mocks/handlers";
import { AUTH_STORAGE_KEY, AuthProvider } from "@/features/auth/auth-provider";

beforeEach(() => {
  resetInventoryForTest();
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
  resetInventoryForTest();
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  vi.restoreAllMocks();
});

function renderPage() {
  render(
    <AuthProvider>
      <InventoryPage />
    </AuthProvider>,
  );
}

describe("InventoryPage", () => {
  it("재고 품목 목록과 상태를 표시한다", async () => {
    renderPage();

    expect(await screen.findByText("전체 품목")).toBeInTheDocument();
    expect(screen.getAllByText("카드단말기 A100").length).toBeGreaterThan(0);
    expect(screen.getAllByText("불일치").length).toBeGreaterThan(0);
  });

  it("품목 추가 모달에서 새 품목을 등록한다", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("전체 품목");

    await user.click(screen.getByRole("button", { name: "품목 추가" }));
    const modal = screen.getByRole("dialog", { name: "실사 품목 추가" });
    await user.type(within(modal).getByLabelText("품목명"), "새 단말기");
    await user.type(within(modal).getByLabelText("보관 위치"), "본사 재고");
    await user.click(within(modal).getByRole("button", { name: "추가" }));

    expect(await screen.findByText("새 단말기")).toBeInTheDocument();
  });

  it("실사 버튼으로 수량을 기록하면 상태가 갱신된다", async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "tech-manager");
    const user = userEvent.setup();
    renderPage();
    const [pendingLabel] = await screen.findAllByText("카드단말기 A100");
    const row = pendingLabel.closest("div.grid") as HTMLElement;

    await user.click(within(row).getByRole("button", { name: "실사" }));
    const modal = screen.getByRole("dialog", {
      name: "카드단말기 A100 실사 기록",
    });
    const qtyInput = within(modal).getByLabelText("실사 수량");
    await user.clear(qtyInput);
    await user.type(qtyInput, "20");
    await user.click(within(modal).getByRole("button", { name: "기록" }));

    await waitFor(() =>
      expect(within(row).getByText("일치")).toBeInTheDocument(),
    );
  });

  it("삭제 버튼을 누르면 확인 후 품목을 제거한다", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    renderPage();
    const row = (await screen.findByText("영수증 프린터 P20")).closest(
      "div.grid",
    ) as HTMLElement;

    await user.click(within(row).getByRole("button", { name: "삭제" }));

    await waitFor(() =>
      expect(screen.queryByText("영수증 프린터 P20")).not.toBeInTheDocument(),
    );
  });
});
