import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker, InlineDatePicker, TextDatePicker } from "./date-picker";

describe("DatePicker", () => {
  it("직접 입력 필드 없이 클릭 시 캘린더를 연다", async () => {
    const user = userEvent.setup();
    render(
      <DatePicker label="접수날짜" value="2026-07-20" onChange={vi.fn()} />,
    );

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "접수날짜 달력 열기" }),
    );

    expect(
      screen.getByRole("dialog", { name: "접수날짜" }),
    ).toBeInTheDocument();
  });
});

describe("InlineDatePicker", () => {
  it("값을 라벨 없이 컴팩트하게 표시하고 클릭 시 캘린더를 연다", async () => {
    const user = userEvent.setup();
    render(
      <InlineDatePicker
        value="2026-07-20"
        ariaLabel="접수일 변경"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("2026-07-20")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "접수일 변경" }));
    expect(
      screen.getByRole("dialog", { name: "접수일 변경" }),
    ).toBeInTheDocument();
  });

  it("dialogAriaLabel을 지정하면 다이얼로그 라벨을 버튼과 다르게 쓸 수 있다", async () => {
    const user = userEvent.setup();
    render(
      <InlineDatePicker
        value="2026-07-20"
        ariaLabel="접수일 변경"
        dialogAriaLabel="접수일"
        onChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "접수일 변경" }));
    expect(screen.getByRole("dialog", { name: "접수일" })).toBeInTheDocument();
  });

  it("날짜를 선택하면 onChange가 호출되고 캘린더가 닫힌다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <InlineDatePicker
        value="2026-07-20"
        ariaLabel="접수일 변경"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "접수일 변경" }));
    await user.click(
      screen.getByRole("button", { name: "2026년 7월 8일 수요일" }),
    );

    expect(onChange).toHaveBeenCalledWith("2026-07-08");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("TextDatePicker", () => {
  it("텍스트 입력으로 직접 타이핑할 수 있다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextDatePicker label="개통일" value="" onChange={onChange} />);

    await user.type(screen.getByLabelText("개통일"), "2");
    expect(onChange).toHaveBeenCalledWith("2");
  });

  it("달력 버튼으로도 날짜를 선택할 수 있다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TextDatePicker label="개통일" value="2026-07-20" onChange={onChange} />,
    );

    await user.click(screen.getByRole("button", { name: "개통일 달력 열기" }));
    await user.click(
      screen.getByRole("button", { name: "2026년 7월 8일 수요일" }),
    );

    expect(onChange).toHaveBeenCalledWith("2026-07-08");
  });
});
