import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "./dialog";

// jsdom은 HTMLDialogElement의 레이아웃/포커스 트랩을 완전히 구현하지 않으므로
// showModal/close 호출 여부와 open 어트리뷰트 동기화만 검증한다.
beforeEach(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
});

afterEach(() => cleanup());

function Example({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} labelledBy="dialog-title">
      <h2 id="dialog-title">신규 접수</h2>
      <p>내용</p>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("open이 true면 showModal로 열린다", () => {
    render(<Example open onClose={vi.fn()} />);
    expect(screen.getByText("신규 접수")).toBeInTheDocument();
    expect(document.querySelector("dialog")).toHaveAttribute("open");
  });

  it("배경(backdrop) 클릭 시 onClose가 호출된다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Example open onClose={onClose} />);
    const dialog = document.querySelector("dialog")!;
    await user.click(dialog);
    expect(onClose).toHaveBeenCalled();
  });

  it("aria-labelledby로 제목과 연결된다", () => {
    render(<Example open onClose={vi.fn()} />);
    expect(document.querySelector("dialog")).toHaveAttribute(
      "aria-labelledby",
      "dialog-title",
    );
  });
});
