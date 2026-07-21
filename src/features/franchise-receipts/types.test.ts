import { describe, expect, it } from "vitest";
import {
  CS_REP_OPTIONS,
  matchesReceiptTab,
  PRODUCT_OPTIONS,
  RECEIPT_STATUS_META,
  type FranchiseReceipt,
} from "./types";

function makeReceipt(
  overrides: Partial<FranchiseReceipt> = {},
): FranchiseReceipt {
  return {
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
    stage: 0,
    due: "07.15",
    memo: "",
    memoHistory: [],
    isMine: false,
    unassigned: true,
    ...overrides,
  };
}

describe("matchesReceiptTab", () => {
  it("담당자와 상품 옵션을 확정 목록 순서로 제공한다", () => {
    expect(CS_REP_OPTIONS.map((option) => option.label)).toEqual([
      "서지은",
      "최혜민",
    ]);
    expect(PRODUCT_OPTIONS.map((option) => option.label)).toEqual([
      "토스프론트",
      "토스단말기",
      "카드단말기",
      "포스기",
      "인터넷",
      "키오스크",
      "영수증프린터",
      "주방프린터기",
      "키오스크리더기",
      "무선단말기",
      "금전함",
      "태블릿",
      "테이블오더",
      "보조배터리",
      "원격",
    ]);
  });

  it("서류 미비와 접수 반려 상태를 서로 다른 라벨로 표시한다", () => {
    expect(RECEIPT_STATUS_META.docMissing.label).toBe("서류미비");
    expect(RECEIPT_STATUS_META.rejected.label).toBe("접수반려");
  });

  it("all 탭은 모든 항목과 매치된다", () => {
    expect(matchesReceiptTab(makeReceipt(), "all")).toBe(true);
  });

  it("mine 탭은 isMine 항목만 매치된다", () => {
    expect(matchesReceiptTab(makeReceipt({ isMine: true }), "mine")).toBe(true);
    expect(matchesReceiptTab(makeReceipt({ isMine: false }), "mine")).toBe(
      false,
    );
  });

  it.each([
    ["docMissing", "docMissing"],
    ["rejected", "rejected"],
    ["review", "review"],
    ["techDone", "techDone"],
  ] as const)("%s 탭은 status가 %s인 항목만 매치된다", (tab, status) => {
    expect(matchesReceiptTab(makeReceipt({ status }), tab)).toBe(true);
    expect(matchesReceiptTab(makeReceipt({ status: "wait" }), tab)).toBe(false);
  });
});
