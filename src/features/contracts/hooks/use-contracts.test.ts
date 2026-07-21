import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useContracts } from "./use-contracts";
import { resetContractsForTest } from "@/mocks/handlers";

beforeEach(() => resetContractsForTest());
afterEach(() => resetContractsForTest());

async function setupLoaded() {
  const { result } = renderHook(() => useContracts());
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
}

describe("useContracts", () => {
  it("초기 계약서 3건을 불러온다", async () => {
    const result = await setupLoaded();
    expect(result.current.contracts).toHaveLength(3);
  });

  it("addContract는 초안 상태로 새 계약서를 추가한다", async () => {
    const result = await setupLoaded();

    await act(async () => {
      await result.current.addContract({
        merchantName: "새 가맹점",
        ownerName: "홍길동",
        phone: "010-1234-5678",
      });
    });

    expect(result.current.contracts).toHaveLength(4);
    const created = result.current.contracts.find(
      (c) => c.merchantName === "새 가맹점",
    );
    expect(created?.status).toBe("draft");
  });

  it("requestSignature는 초안을 서명대기로 전환한다", async () => {
    const result = await setupLoaded();
    const draft = result.current.contracts.find((c) => c.status === "draft");
    expect(draft).toBeTruthy();

    await act(async () => {
      await result.current.requestSignature(draft!.id);
    });

    const updated = result.current.contracts.find((c) => c.id === draft!.id);
    expect(updated?.status).toBe("pending");
    expect(updated?.sentAt).toBeTruthy();
  });

  it("markSigned는 서명대기를 서명완료로 전환한다", async () => {
    const result = await setupLoaded();
    const pending = result.current.contracts.find(
      (c) => c.status === "pending",
    );
    expect(pending).toBeTruthy();

    await act(async () => {
      await result.current.markSigned(pending!.id);
    });

    const updated = result.current.contracts.find((c) => c.id === pending!.id);
    expect(updated?.status).toBe("signed");
    expect(updated?.signedAt).toBeTruthy();
  });

  it("removeContract는 계약서를 삭제한다", async () => {
    const result = await setupLoaded();
    const target = result.current.contracts[0];

    await act(async () => {
      await result.current.removeContract(target.id);
    });

    expect(result.current.contracts.some((c) => c.id === target.id)).toBe(
      false,
    );
  });
});
