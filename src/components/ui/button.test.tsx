import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("기본값은 button 타입, secondary variant로 렌더링된다", () => {
    render(<Button>저장</Button>);
    const button = screen.getByRole("button", { name: "저장" });
    expect(button).toHaveAttribute("type", "button");
    expect(button.className).toContain("bg-card");
  });

  it.each([
    ["primary", "bg-primary"],
    ["danger", "bg-error"],
  ] as const)("%s variant는 %s 클래스를 포함한다", (variant, expected) => {
    render(<Button variant={variant}>실행</Button>);
    expect(screen.getByRole("button", { name: "실행" }).className).toContain(
      expected,
    );
  });

  it("클릭 핸들러가 호출된다", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>확인</Button>);
    await user.click(screen.getByRole("button", { name: "확인" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("disabled면 클릭이 무시된다", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        확인
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "확인" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
