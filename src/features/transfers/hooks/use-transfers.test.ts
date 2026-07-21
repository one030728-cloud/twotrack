import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useTransfers } from "./use-transfers";
import { resetTransfersForTest } from "@/mocks/handlers";

beforeEach(() => resetTransfersForTest());
afterEach(() => resetTransfersForTest());

async function setupLoaded() {
  const { result } = renderHook(() => useTransfers());
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
}

describe("useTransfers", () => {
  it("초기 전환건 3건을 불러온다", async () => {
    const result = await setupLoaded();
    expect(result.current.transfers).toHaveLength(3);
  });

  it("addTransfer는 새 전환건을 접수 상태로 추가한다", async () => {
    const result = await setupLoaded();

    await act(async () => {
      await result.current.addTransfer({
        name: "새 매장",
        owner: "홍길동",
        phone: "010-1234-5678",
        transferType: "명의변경",
      });
    });

    expect(result.current.transfers).toHaveLength(4);
    const created = result.current.transfers.find((t) => t.name === "새 매장");
    expect(created?.status).toBe("receipt");
  });

  it("editTransfer는 상태를 변경한다", async () => {
    const result = await setupLoaded();
    const target = result.current.transfers[0];

    await act(async () => {
      await result.current.editTransfer(target.id, { status: "done" });
    });

    const updated = result.current.transfers.find((t) => t.id === target.id);
    expect(updated?.status).toBe("done");
  });

  it("removeTransfer는 전환건을 삭제한다", async () => {
    const result = await setupLoaded();
    const target = result.current.transfers[0];

    await act(async () => {
      await result.current.removeTransfer(target.id);
    });

    expect(result.current.transfers.some((t) => t.id === target.id)).toBe(
      false,
    );
  });
});
