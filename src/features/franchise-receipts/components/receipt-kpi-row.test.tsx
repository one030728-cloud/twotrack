import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReceiptKpiRow } from "./receipt-kpi-row";
import type { ReceiptKpi } from "@/features/franchise-receipts/types";

const KPIS: ReceiptKpi[] = [
  { key: "today", label: "오늘 접수", value: 12 },
  { key: "docMissing", label: "서류 미비", value: 4 },
];

describe("ReceiptKpiRow", () => {
  it("각 KPI의 라벨과 값을 표시한다", () => {
    render(<ReceiptKpiRow kpis={KPIS} onKpiClick={vi.fn()} />);
    expect(screen.getByText("오늘 접수")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("서류 미비")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("카드 전체를 버튼으로 제공하고 클릭한 KPI 키를 전달한다", async () => {
    const user = userEvent.setup();
    const onKpiClick = vi.fn();
    render(<ReceiptKpiRow kpis={KPIS} onKpiClick={onKpiClick} />);

    await user.click(screen.getByRole("button", { name: /서류 미비 4건/ }));

    expect(onKpiClick).toHaveBeenCalledWith("docMissing");
  });
});
