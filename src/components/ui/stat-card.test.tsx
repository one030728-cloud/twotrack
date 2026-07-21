import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClipboardListIcon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { StatCard } from "./stat-card";

describe("StatCard", () => {
  it("기본 단위와 통계 값을 표시한다", () => {
    render(
      <StatCard
        label="오늘 접수"
        value={8}
        icon={ClipboardListIcon}
        tone="blue"
      />,
    );

    expect(screen.getByText("오늘 접수")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("건")).toBeInTheDocument();
  });

  it("onClick이 없으면 버튼이 아닌 정적 카드로 렌더링된다", () => {
    render(<StatCard label="오늘 접수" value={8} icon={ClipboardListIcon} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("onClick이 있으면 버튼으로 렌더링되고 클릭 시 호출된다", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <StatCard
        label="서류 대기"
        value={2}
        icon={ClipboardListIcon}
        onClick={onClick}
      />,
    );

    const button = screen.getByRole("button", { name: "서류 대기 2건" });
    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("active면 aria-pressed가 true가 되고 강조 스타일이 적용된다", () => {
    render(
      <StatCard
        label="서류 대기"
        value={2}
        icon={ClipboardListIcon}
        onClick={vi.fn()}
        active
      />,
    );

    const button = screen.getByRole("button", { name: "서류 대기 2건" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button.className).toContain("border-primary");
  });

  it("ariaLabel을 지정하면 접근 가능한 이름을 덮어쓴다", () => {
    render(
      <StatCard
        label="오늘 접수"
        value={8}
        icon={ClipboardListIcon}
        onClick={vi.fn()}
        ariaLabel="오늘 접수 커스텀 라벨"
      />,
    );

    expect(
      screen.getByRole("button", { name: "오늘 접수 커스텀 라벨" }),
    ).toBeInTheDocument();
  });
});
