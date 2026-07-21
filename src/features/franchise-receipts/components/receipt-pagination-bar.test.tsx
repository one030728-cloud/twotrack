import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReceiptPaginationBar } from "./receipt-pagination-bar";

function renderBar(
  overrides: Partial<Parameters<typeof ReceiptPaginationBar>[0]> = {},
) {
  const props = {
    currentPage: 1,
    totalPages: 3,
    onPrev: vi.fn(),
    onNext: vi.fn(),
    onGoToPage: vi.fn(),
    pageSize: 10,
    onPageSizeChange: vi.fn(),
    selectedCount: 0,
    totalFilteredCount: 18,
    onSelectAllFiltered: vi.fn(),
    ...overrides,
  };
  render(<ReceiptPaginationBar {...props} />);
  return props;
}

describe("ReceiptPaginationBar", () => {
  it("첫 페이지에서는 이전 버튼이 비활성화된다", () => {
    renderBar();
    expect(screen.getByRole("button", { name: "이전 페이지" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "다음 페이지" })).toBeEnabled();
  });

  it("페이지 번호 클릭 시 onGoToPage가 호출된다", async () => {
    const user = userEvent.setup();
    const props = renderBar();
    await user.click(screen.getByRole("button", { name: "2페이지" }));
    expect(props.onGoToPage).toHaveBeenCalledWith(2);
  });

  it("선택된 항목이 있으면 선택 개수를 보여준다", () => {
    renderBar({ selectedCount: 3 });
    expect(screen.getByText("3건 선택됨")).toBeInTheDocument();
  });

  it("일부만 선택됐을 때 필터링된 전체 선택 버튼을 클릭하면 onSelectAllFiltered가 호출된다", async () => {
    const user = userEvent.setup();
    const props = renderBar({ selectedCount: 3, totalFilteredCount: 18 });
    await user.click(
      screen.getByRole("button", { name: "필터링된 전체 18건 선택" }),
    );
    expect(props.onSelectAllFiltered).toHaveBeenCalledOnce();
  });

  it("전체가 이미 선택됐으면 필터링된 전체 선택 버튼을 숨긴다", () => {
    renderBar({ selectedCount: 18, totalFilteredCount: 18 });
    expect(
      screen.queryByRole("button", { name: /필터링된 전체/ }),
    ).not.toBeInTheDocument();
  });
});
