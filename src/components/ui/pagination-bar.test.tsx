import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PaginationBar } from "./pagination-bar";

describe("PaginationBar", () => {
  it("페이지 이동과 페이지 크기 변경을 전달한다", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    render(
      <PaginationBar
        currentPage={2}
        totalPages={4}
        onPageChange={onPageChange}
        pageSize={10}
        onPageSizeChange={onPageSizeChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "다음 페이지" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
    await user.click(screen.getByLabelText("페이지당 표시 개수"));
    await user.click(screen.getByRole("option", { name: "20개씩 보기" }));
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });
});
