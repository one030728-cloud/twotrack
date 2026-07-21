import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

describe("Input", () => {
  it("label과 input이 htmlFor/id로 연결된다", () => {
    render(<Input label="상호명" />);
    expect(screen.getByRole("textbox", { name: "상호명" })).toBeInTheDocument();
  });

  it("hideLabel이면 label이 시각적으로 숨겨지지만 접근성 트리에는 남는다", () => {
    render(<Input label="통합 검색" hideLabel placeholder="검색" />);
    expect(
      screen.getByRole("textbox", { name: "통합 검색" }),
    ).toBeInTheDocument();
  });

  it("error가 있으면 aria-invalid와 role=alert 메시지를 연결한다", () => {
    render(<Input label="연락처" error="형식이 올바르지 않습니다" />);
    const input = screen.getByRole("textbox", { name: "연락처" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "형식이 올바르지 않습니다",
    );
    expect(input.getAttribute("aria-describedby")).toBe(
      screen.getByRole("alert").id,
    );
  });

  it("입력값을 타이핑할 수 있다", async () => {
    const user = userEvent.setup();
    render(<Input label="상호명" />);
    const input = screen.getByRole("textbox", { name: "상호명" });
    await user.type(input, "카페 아모르");
    expect(input).toHaveValue("카페 아모르");
  });
});
