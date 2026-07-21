import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("label 클릭으로 체크 상태를 토글할 수 있다", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="전체 선택" />);
    const checkbox = screen.getByRole("checkbox", { name: "전체 선택" });
    expect(checkbox).not.toBeChecked();
    await user.click(screen.getByText("전체 선택"));
    expect(checkbox).toBeChecked();
  });

  it("label 없이도 렌더링된다 (호출부에서 aria-label 지정)", () => {
    render(<Checkbox aria-label="행 선택" />);
    expect(
      screen.getByRole("checkbox", { name: "행 선택" }),
    ).toBeInTheDocument();
  });
});
