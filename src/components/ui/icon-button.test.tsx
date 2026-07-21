import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconButton } from "./icon-button";

describe("IconButton", () => {
  it("aria-label로 접근 가능한 이름을 노출한다", () => {
    render(<IconButton aria-label="도움말" />);
    expect(screen.getByRole("button", { name: "도움말" })).toBeInTheDocument();
  });

  it("클릭 핸들러가 호출된다", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton aria-label="엑셀 다운로드" onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: "엑셀 다운로드" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
