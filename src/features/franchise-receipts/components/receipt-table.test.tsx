import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SnackbarProvider } from "@/components/ui/snackbar";
import { ReceiptTable } from "./receipt-table";
import type { FranchiseReceipt } from "@/features/franchise-receipts/types";

const RECEIPTS: FranchiseReceipt[] = [
  {
    id: 1,
    receiptDate: "2026-07-13",
    channel: "직접 영업",
    bizType: "개인 사업자",
    name: "카페 아모르",
    owner: "김아름",
    phone: "010-2231-8842",
    bizNo: "000-00-00000",
    salesRep: "-",
    csRep: null,
    internet: "-",
    status: "wait",
    stage: 1,
    due: "07.15",
    memo: "서류 미제출",
    memoHistory: [],
    isMine: false,
    unassigned: true,
  },
];

function renderTable(
  overrides: Partial<Parameters<typeof ReceiptTable>[0]> = {},
) {
  const props = {
    receipts: RECEIPTS,
    selected: {},
    allSelected: false,
    onToggleRow: vi.fn(),
    onToggleSelectAll: vi.fn(),
    onUpdateField: vi.fn(),
    onOpenDetail: vi.fn(),
    onOpenMemo: vi.fn(),
    pageSize: 10,
    ...overrides,
  };
  render(
    <SnackbarProvider>
      <ReceiptTable {...props} />
    </SnackbarProvider>,
  );
  return props;
}

describe("ReceiptTable", () => {
  it("행 데이터를 렌더링한다", () => {
    renderTable();
    expect(screen.getByText("카페 아모르")).toBeInTheDocument();
    expect(screen.getByText("김아름")).toBeInTheDocument();
    expect(screen.getByText("010-2231-8842")).toBeInTheDocument();
  });

  it("접수일 클릭 시 달력을 연다", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(
      screen.getByRole("button", { name: "카페 아모르 접수일 변경" }),
    );

    expect(
      await screen.findByRole("dialog", { name: "카페 아모르 접수일" }),
    ).toBeInTheDocument();
  });

  it("행 체크박스 클릭 시 onToggleRow가 호출된다", async () => {
    const user = userEvent.setup();
    const props = renderTable();
    await user.click(
      screen.getByRole("checkbox", { name: "카페 아모르 선택" }),
    );
    expect(props.onToggleRow).toHaveBeenCalledWith(1);
  });

  it("전체 선택 체크박스 클릭 시 onToggleSelectAll이 호출된다", async () => {
    const user = userEvent.setup();
    const props = renderTable();
    await user.click(screen.getByRole("checkbox", { name: "전체 선택" }));
    expect(props.onToggleSelectAll).toHaveBeenCalledOnce();
  });

  it("상태 select 변경 시 onUpdateField가 status 패치로 호출된다", async () => {
    const user = userEvent.setup();
    const props = renderTable();
    await user.click(
      screen.getByRole("combobox", { name: "카페 아모르 상태" }),
    );
    await user.click(await screen.findByRole("option", { name: "완료" }));
    expect(props.onUpdateField).toHaveBeenCalledWith(1, { status: "done" });
  });

  it("담당자는 미배정을 placeholder로 표시하고 실제 담당자만 선택한다", async () => {
    const user = userEvent.setup();
    const props = renderTable();
    expect(
      screen.getByRole("combobox", { name: "카페 아모르 담당자" }),
    ).toHaveTextContent("미배정");
    await user.click(
      screen.getByRole("combobox", { name: "카페 아모르 담당자" }),
    );
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["서지은", "최혜민"]);
    await user.click(await screen.findByRole("option", { name: "서지은" }));
    expect(props.onUpdateField).toHaveBeenCalledWith(1, { csRep: "서지은" });
  });

  it("연락처 클릭 시 복사 snackbar를 표시한다", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    renderTable();
    await user.click(screen.getByRole("button", { name: "010-2231-8842" }));

    expect(writeText).toHaveBeenCalledWith("010-2231-8842");
    expect(await screen.findByRole("status")).toHaveTextContent(
      "연락처 복사됨",
    );
  });

  it("상태, 진행률, 메모 헤더는 정렬 버튼을 표시하지 않는다", () => {
    renderTable();

    expect(
      screen.queryByRole("button", { name: "상태 정렬" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "진행률 정렬" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "메모 정렬" }),
    ).not.toBeInTheDocument();
  });
});
