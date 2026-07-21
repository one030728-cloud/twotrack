import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useExternalTechs } from "./use-external-techs";
import { resetExternalTechsForTest } from "@/mocks/handlers";

beforeEach(() => resetExternalTechsForTest());
afterEach(() => resetExternalTechsForTest());

async function setupLoaded() {
  const { result } = renderHook(() => useExternalTechs());
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
}

describe("useExternalTechs", () => {
  it("초기 외부 기사 3명을 불러온다", async () => {
    const result = await setupLoaded();
    expect(result.current.externalTechs).toHaveLength(3);
  });

  it("addExternalTech는 새 외부 기사를 추가한다", async () => {
    const result = await setupLoaded();

    await act(async () => {
      await result.current.addExternalTech({
        name: "새 기사",
        phone: "010-1234-5678",
      });
    });

    expect(result.current.externalTechs).toHaveLength(4);
    const created = result.current.externalTechs.find(
      (t) => t.name === "새 기사",
    );
    expect(created?.status).toBe("active");
  });

  it("editExternalTech는 상태를 변경한다", async () => {
    const result = await setupLoaded();
    const target = result.current.externalTechs[0];

    await act(async () => {
      await result.current.editExternalTech(target.id, {
        status: "inactive",
      });
    });

    const updated = result.current.externalTechs.find(
      (t) => t.id === target.id,
    );
    expect(updated?.status).toBe("inactive");
  });

  it("removeExternalTech는 외부 기사를 삭제한다", async () => {
    const result = await setupLoaded();
    const target = result.current.externalTechs[0];

    await act(async () => {
      await result.current.removeExternalTech(target.id);
    });

    expect(result.current.externalTechs.some((t) => t.id === target.id)).toBe(
      false,
    );
  });
});
