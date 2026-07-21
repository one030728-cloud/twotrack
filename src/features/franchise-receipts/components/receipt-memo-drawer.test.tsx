import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReceiptMemoDrawer } from "./receipt-memo-drawer";
import type { FranchiseReceipt } from "@/features/franchise-receipts/types";

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});

const RECEIPT: FranchiseReceipt = {
  id: 1,
  receiptDate: "2026-07-19",
  channel: "직접 영업",
  bizType: "개인 사업자",
  name: "카페 아모르",
  owner: "김아름",
  phone: "010-2231-8842",
  bizNo: "000-00-00000",
  salesRep: "서지은",
  csRep: null,
  internet: "-",
  status: "wait",
  stage: 1,
  due: "07.20",
  memo: "고객 안내 완료",
  memoHistory: [
    {
      id: "1-seed-registered",
      meta: "2026.07.19 · 시스템",
      content: "신규 접수가 등록되었습니다.",
      pinned: false,
    },
    {
      id: "1-seed-memo",
      meta: "2026.07.19 · 담당 CS",
      content: "고객 안내 완료",
      pinned: false,
    },
  ],
  isMine: false,
  unassigned: true,
};

describe("ReceiptMemoDrawer", () => {
  it("시스템 이력은 변경 이력으로 분류하고 삭제 버튼을 표시하지 않는다", async () => {
    const user = userEvent.setup();
    render(
      <ReceiptMemoDrawer
        receipt={RECEIPT}
        onClose={vi.fn()}
        onUpdateField={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("button", { name: "삭제" })).toHaveLength(1);

    await user.click(screen.getByRole("tab", { name: "변경 이력" }));

    expect(screen.getByText("신규 접수가 등록되었습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "삭제" })).toBeNull();
  });
});
