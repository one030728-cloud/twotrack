import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReceiptFilters } from "./receipt-filters";

function renderFilters(
  overrides: Partial<Parameters<typeof ReceiptFilters>[0]> = {},
) {
  const props = {
    searchQuery: "",
    onSearchQueryChange: vi.fn(),
    channelFilter: "all" as const,
    onChannelFilterChange: vi.fn(),
    bizTypeFilter: "all" as const,
    onBizTypeFilterChange: vi.fn(),
    statusFilter: "all" as const,
    onStatusFilterChange: vi.fn(),
    internetFilter: "all",
    onInternetFilterChange: vi.fn(),
    receiptDateRange: { from: null, to: null },
    onReceiptDateRangeChange: vi.fn(),
    ...overrides,
  };
  render(<ReceiptFilters {...props} />);
  return props;
}

describe("ReceiptFilters", () => {
  it("검색어 입력 시 onSearchQueryChange가 호출된다", async () => {
    const user = userEvent.setup();
    const props = renderFilters();
    await user.type(
      screen.getByPlaceholderText(
        "상호명, 대표자, 연락처, 사업자번호 통합 검색",
      ),
      "카",
    );
    expect(props.onSearchQueryChange).toHaveBeenCalled();
  });

  it("고급 필터는 기본적으로 열려 있고 클릭 시 닫힌다", async () => {
    const user = userEvent.setup();
    renderFilters();
    expect(screen.getByText("사업자 유형 전체")).toBeInTheDocument();
    expect(screen.getByText("접수 채널 전체")).toBeInTheDocument();
    expect(screen.queryByText("등록일순")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /고급 필터/ }));
    expect(screen.queryByText("사업자 유형 전체")).not.toBeInTheDocument();
  });

  it("필터 dropdown을 상태, 접수 채널, 사업자 유형, 인터넷 순서로 표시한다", () => {
    renderFilters();

    const filters = screen.getAllByRole("combobox");
    expect(filters.map((filter) => filter.textContent)).toEqual([
      expect.stringContaining("전체"),
      expect.stringContaining("접수 채널 전체"),
      expect.stringContaining("사업자 유형 전체"),
      expect.stringContaining("인터넷 전체"),
    ]);
  });

  it("초기화 클릭 시 검색어와 고급 필터를 기본값으로 되돌린다", async () => {
    const user = userEvent.setup();
    const props = renderFilters({
      searchQuery: "카페",
      statusFilter: "review",
      channelFilter: "직접 영업",
      bizTypeFilter: "개인 사업자",
      internetFilter: "3S",
      receiptDateRange: { from: "2026-07-01", to: "2026-07-17" },
    });

    await user.click(screen.getByRole("button", { name: "초기화" }));

    expect(props.onSearchQueryChange).toHaveBeenCalledWith("");
    expect(props.onStatusFilterChange).toHaveBeenCalledWith("all");
    expect(props.onBizTypeFilterChange).toHaveBeenCalledWith("all");
    expect(props.onChannelFilterChange).toHaveBeenCalledWith("all");
    expect(props.onInternetFilterChange).toHaveBeenCalledWith("all");
    expect(props.onReceiptDateRangeChange).toHaveBeenCalledWith({
      from: null,
      to: null,
    });
  });
});
