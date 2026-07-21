import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "./select";

const OPTIONS = [
  { value: "wait", label: "정보입력" },
  { value: "done", label: "완료" },
];

describe("Select", () => {
  it("label과 select가 연결되고 옵션을 선택할 수 있다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select
        label="상태"
        value="wait"
        onValueChange={onValueChange}
        options={OPTIONS}
      />,
    );
    const trigger = screen.getByRole("combobox", { name: "상태" });
    await user.click(trigger);
    expect(trigger).toHaveClass("data-[state=open]:border-primary");
    await user.click(await screen.findByRole("option", { name: "완료" }));
    expect(onValueChange).toHaveBeenCalledWith("done");
  });

  it("hideLabel이면 접근성 이름은 유지된다", () => {
    render(
      <Select
        label="정렬"
        hideLabel
        value="latest"
        onValueChange={vi.fn()}
        options={[{ value: "latest", label: "등록일순" }]}
      />,
    );
    expect(screen.getByRole("combobox", { name: "정렬" })).toBeInTheDocument();
  });

  it("값이 없으면 placeholder를 표시하되 옵션으로 제공하지 않는다", async () => {
    const user = userEvent.setup();
    render(
      <Select
        label="담당자"
        value={null}
        placeholder="미배정"
        onValueChange={vi.fn()}
        options={[
          { value: "서지은", label: "서지은" },
          { value: "최혜민", label: "최혜민" },
        ]}
      />,
    );

    expect(screen.getByRole("combobox", { name: "담당자" })).toHaveTextContent(
      "미배정",
    );

    await user.click(screen.getByRole("combobox", { name: "담당자" }));

    expect(screen.queryByRole("option", { name: "미배정" })).toBeNull();
  });
});
