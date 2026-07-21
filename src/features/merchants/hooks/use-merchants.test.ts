import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useMerchants } from "./use-merchants";
import { resetMerchantsForTest } from "@/mocks/handlers";

beforeEach(() => resetMerchantsForTest());
afterEach(() => resetMerchantsForTest());

async function setupLoaded() {
  const { result } = renderHook(() => useMerchants());
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
}

describe("useMerchants", () => {
  it("초기 가맹점 4곳을 불러온다", async () => {
    const result = await setupLoaded();
    expect(result.current.merchants).toHaveLength(4);
  });

  it("addMerchant는 새 가맹점을 추가한다", async () => {
    const result = await setupLoaded();

    await act(async () => {
      await result.current.addMerchant({
        name: "새 가맹점",
        owner: "홍길동",
        phone: "010-1234-5678",
      });
    });

    expect(result.current.merchants).toHaveLength(5);
    const created = result.current.merchants.find(
      (m) => m.name === "새 가맹점",
    );
    expect(created?.status).toBe("consulting");
  });

  it("editMerchant는 상태를 변경한다", async () => {
    const result = await setupLoaded();
    const target = result.current.merchants[0];

    await act(async () => {
      await result.current.editMerchant(target.id, { status: "terminated" });
    });

    const updated = result.current.merchants.find((m) => m.id === target.id);
    expect(updated?.status).toBe("terminated");
  });

  it("removeMerchant는 가맹점을 삭제한다", async () => {
    const result = await setupLoaded();
    const target = result.current.merchants[0];

    await act(async () => {
      await result.current.removeMerchant(target.id);
    });

    expect(result.current.merchants.some((m) => m.id === target.id)).toBe(
      false,
    );
  });
});
