import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReceiptTabs } from "./receipt-tabs";
import {
  RECEIPT_TABS,
  type ReceiptTabKey,
} from "@/features/franchise-receipts/types";

const tabCounts = RECEIPT_TABS.reduce(
  (acc, t, i) => {
    acc[t.key] = i;
    return acc;
  },
  {} as Record<ReceiptTabKey, number>,
);

describe("ReceiptTabs", () => {
  it("탭별 개수 배지를 표시하고 활성 탭을 aria-selected로 나타낸다", () => {
    render(
      <ReceiptTabs activeTab="all" tabCounts={tabCounts} onChange={vi.fn()} />,
    );
    const allTab = screen.getByRole("tab", { name: /전체/ });
    expect(allTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /서류 미비/ })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(
      screen.queryByRole("tab", { name: /설치 대기/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /설치 완료/ }),
    ).not.toBeInTheDocument();
  });

  it("탭 클릭 시 onChange가 해당 키로 호출된다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ReceiptTabs activeTab="all" tabCounts={tabCounts} onChange={onChange} />,
    );
    await user.click(screen.getByRole("tab", { name: /내 업무/ }));
    expect(onChange).toHaveBeenCalledWith("mine");
  });
});
