import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterPanel } from "./filter-panel";

describe("FilterPanel", () => {
  it("검색과 고급 필터 표시를 공통으로 제어한다", async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    render(
      <FilterPanel
        query=""
        onQueryChange={onQueryChange}
        searchPlaceholder="검색"
      >
        <span>필터 내용</span>
      </FilterPanel>,
    );

    await user.type(screen.getByLabelText("통합 검색"), "카페");
    expect(onQueryChange).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "고급 필터" }));
    expect(screen.queryByText("필터 내용")).not.toBeInTheDocument();
  });
});
