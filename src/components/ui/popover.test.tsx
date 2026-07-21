import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Popover, PopoverPanel, PopoverItem } from "./popover";

function Example() {
  return (
    <Popover>
      {({ open, toggle, close, panelId }) => (
        <>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={toggle}
          >
            열기
          </button>
          {open && (
            <PopoverPanel id={panelId} role="menu">
              <PopoverItem onClick={close}>항목 1</PopoverItem>
            </PopoverPanel>
          )}
        </>
      )}
    </Popover>
  );
}

describe("Popover", () => {
  it("트리거 클릭 시 패널이 열리고 닫힌다", async () => {
    const user = userEvent.setup();
    render(<Example />);

    const trigger = screen.getByRole("button", { name: "열기" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("바깥을 클릭하면 닫힌다", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Example />
        <button type="button">바깥</button>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "열기" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "바깥" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("Escape 키를 누르면 닫힌다", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole("button", { name: "열기" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("메뉴 항목 클릭 시 close 콜백으로 패널이 닫힌다", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole("button", { name: "열기" }));
    await user.click(screen.getByRole("menuitem", { name: "항목 1" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
