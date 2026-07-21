import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoDrawer } from "./memo-drawer";

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});

describe("MemoDrawer", () => {
  it("메모와 변경 이력을 탭으로 구분하고 새 메모를 등록한다", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <MemoDrawer
        subject="성수 베이커리"
        description="김아름 · 개인 사업자 · 010-2231-8842"
        items={[
          {
            id: "1",
            type: "변경 이력",
            meta: "방금",
            content: "상태 변경",
          },
        ]}
        onClose={vi.fn()}
        onAdd={onAdd}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "성수 베이커리" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("김아름 · 개인 사업자 · 010-2231-8842"),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("메모 입력"), "통화 완료");
    await user.click(screen.getByRole("button", { name: "메모 등록" }));
    expect(onAdd).toHaveBeenCalledWith("통화 완료");
    await user.click(screen.getByRole("tab", { name: "변경 이력" }));
    expect(screen.getByText("상태 변경")).toBeInTheDocument();
  });

  it("삭제 가능한 메모 항목에만 삭제 버튼을 표시한다", () => {
    const onTogglePin = vi.fn();
    render(
      <MemoDrawer
        subject="성수 베이커리"
        items={[
          {
            id: "1",
            type: "메모",
            meta: "방금 · 나",
            content: "삭제 가능 메모",
          },
          {
            id: "2",
            type: "메모",
            meta: "2026.07.16 · 시스템",
            content: "시스템 메모",
            removable: false,
          },
          {
            id: "3",
            type: "변경 이력",
            meta: "2026.07.16 · 시스템",
            content: "상태 변경",
          },
        ]}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        onTogglePin={onTogglePin}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("button", { name: "삭제" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "고정" })).toHaveLength(3);
  });
});
