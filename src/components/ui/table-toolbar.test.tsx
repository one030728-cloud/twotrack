import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TableToolbar } from "./table-toolbar";

describe("TableToolbar", () => {
  it("전체 건수와 탭 슬롯을 렌더링한다", () => {
    render(
      <TableToolbar
        tabs={<div>탭 영역</div>}
        totalCount={18}
        onExport={vi.fn()}
      />,
    );

    expect(screen.getByText("탭 영역")).toBeInTheDocument();
    expect(screen.getByText("전체 18건")).toBeInTheDocument();
  });

  it("엑셀 다운로드 버튼 클릭 시 onExport가 호출된다", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    render(<TableToolbar tabs={null} totalCount={0} onExport={onExport} />);

    await user.click(screen.getByRole("button", { name: "엑셀 다운로드" }));
    expect(onExport).toHaveBeenCalledOnce();
  });

  it("도움말 버튼 클릭 시 onHelp가 호출된다", async () => {
    const user = userEvent.setup();
    const onHelp = vi.fn();
    render(
      <TableToolbar
        tabs={null}
        totalCount={0}
        onExport={vi.fn()}
        onHelp={onHelp}
      />,
    );

    await user.click(screen.getByRole("button", { name: "도움말" }));
    expect(onHelp).toHaveBeenCalledOnce();
  });

  it("exportLabel/helpLabel로 버튼 라벨을 변경할 수 있다", () => {
    render(
      <TableToolbar
        tabs={null}
        totalCount={0}
        onExport={vi.fn()}
        exportLabel="CSV 다운로드"
        helpLabel="가이드"
      />,
    );

    expect(
      screen.getByRole("button", { name: "CSV 다운로드" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "가이드" })).toBeInTheDocument();
  });
});
