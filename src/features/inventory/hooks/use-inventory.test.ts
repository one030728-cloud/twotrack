import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useInventory } from "./use-inventory";
import { resetInventoryForTest } from "@/mocks/handlers";

beforeEach(() => resetInventoryForTest());
afterEach(() => resetInventoryForTest());

async function setupLoaded() {
  const { result } = renderHook(() => useInventory());
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
}

describe("useInventory", () => {
  it("초기 재고 품목 3개를 불러온다", async () => {
    const result = await setupLoaded();
    expect(result.current.items).toHaveLength(3);
  });

  it("addItem은 새 품목을 실사대기 상태로 추가한다", async () => {
    const result = await setupLoaded();

    await act(async () => {
      await result.current.addItem({
        modelName: "새 단말기",
        location: "본사 재고",
        expectedQty: 10,
      });
    });

    expect(result.current.items).toHaveLength(4);
    const created = result.current.items.find(
      (i) => i.modelName === "새 단말기",
    );
    expect(created?.status).toBe("pending");
    expect(created?.countedQty).toBeNull();
  });

  it("recordCount는 장부수량과 일치하면 matched, 다르면 mismatched로 표시한다", async () => {
    const result = await setupLoaded();
    const pendingItem = result.current.items.find(
      (i) => i.status === "pending",
    );
    expect(pendingItem).toBeTruthy();

    await act(async () => {
      await result.current.recordCount(pendingItem!.id, {
        countedQty: pendingItem!.expectedQty,
        countedBy: "테스트 실사자",
      });
    });

    const matched = result.current.items.find((i) => i.id === pendingItem!.id);
    expect(matched?.status).toBe("matched");
    expect(matched?.countedBy).toBe("테스트 실사자");

    await act(async () => {
      await result.current.recordCount(pendingItem!.id, {
        countedQty: pendingItem!.expectedQty + 1,
        countedBy: "테스트 실사자",
      });
    });

    const mismatched = result.current.items.find(
      (i) => i.id === pendingItem!.id,
    );
    expect(mismatched?.status).toBe("mismatched");
  });

  it("removeItem은 품목을 삭제한다", async () => {
    const result = await setupLoaded();
    const target = result.current.items[0];

    await act(async () => {
      await result.current.removeItem(target.id);
    });

    expect(result.current.items.some((i) => i.id === target.id)).toBe(false);
  });
});
