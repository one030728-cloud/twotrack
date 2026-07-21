import { afterEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useFranchiseReceipts } from "./use-franchise-receipts";
import { resetReceiptsForTest } from "@/mocks/handlers";

afterEach(() => resetReceiptsForTest());

async function setupLoaded() {
  const { result } = renderHook(() => useFranchiseReceipts());
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
}

describe("useFranchiseReceipts", () => {
  it("전체 18건을 불러오고 첫 페이지는 기본 50건 기준으로 보여준다", async () => {
    const result = await setupLoaded();
    expect(result.current.receipts).toHaveLength(18);
    expect(result.current.filteredReceipts).toHaveLength(18);
    expect(result.current.pagedReceipts).toHaveLength(18);
    expect(result.current.totalPages).toBe(1);
  });

  it("탭을 전환하면 해당 상태의 건수만 필터링되고 1페이지로 리셋된다", async () => {
    const result = await setupLoaded();

    act(() => result.current.setPage(2));
    act(() => result.current.setActiveTab("docMissing"));

    expect(result.current.currentPage).toBe(1);
    expect(
      result.current.filteredReceipts.every((r) => r.status === "docMissing"),
    ).toBe(true);
    expect(result.current.tabCounts.docMissing).toBe(
      result.current.filteredReceipts.length,
    );
  });

  it("검색어로 상호명/대표자/연락처/사업자번호를 필터링한다", async () => {
    const result = await setupLoaded();

    act(() => result.current.setSearchQuery("카페 아모르"));

    expect(result.current.filteredReceipts).toHaveLength(1);
    expect(result.current.filteredReceipts[0].name).toBe("카페 아모르");
  });

  it("행 선택/전체 선택/해제가 동작한다", async () => {
    const result = await setupLoaded();

    act(() => result.current.toggleRow(1));
    expect(result.current.selectedCount).toBe(1);

    act(() => result.current.toggleSelectAll());
    expect(result.current.allSelected).toBe(true);
    expect(result.current.selectedCount).toBe(18);

    act(() => result.current.clearSelection());
    expect(result.current.selectedCount).toBe(0);
  });

  it("updateField는 목록을 낙관적으로 갱신한다", async () => {
    const result = await setupLoaded();

    act(() => result.current.updateField(1, { status: "done" }));

    expect(result.current.receipts.find((r) => r.id === 1)?.status).toBe(
      "done",
    );
  });

  it("접수 채널/사업자 유형 필터가 조합되어 적용된다", async () => {
    const result = await setupLoaded();

    act(() => result.current.setChannelFilter("전환"));
    expect(
      result.current.filteredReceipts.every((r) => r.channel === "전환"),
    ).toBe(true);

    // mock 데이터상 "전환" 채널은 전부 법인 사업자이므로 개인 사업자로 좁히면 0건이 된다.
    act(() => result.current.setBizTypeFilter("개인 사업자"));
    expect(result.current.filteredReceipts).toHaveLength(0);
  });

  it("정렬 순서를 오래된순으로 바꾸면 접수일 오름차순이 된다", async () => {
    const result = await setupLoaded();

    act(() => result.current.setSortOrder("oldest"));

    const dates = result.current.filteredReceipts.map((r) => r.receiptDate);
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
  });

  it("addReceipt는 새 항목을 맨 앞에 추가한다", async () => {
    const result = await setupLoaded();

    await act(async () => {
      await result.current.addReceipt({
        name: "새 매장",
        owner: "홍길동",
        phone: "010-1111-2222",
        channel: "토스리드건",
        bizType: "개인 사업자",
      });
    });

    expect(result.current.receipts).toHaveLength(19);
    expect(result.current.receipts[0].name).toBe("새 매장");
  });
});
