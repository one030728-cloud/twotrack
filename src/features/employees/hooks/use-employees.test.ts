import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useEmployees } from "./use-employees";
import { resetEmployeesForTest } from "@/mocks/handlers";

beforeEach(() => resetEmployeesForTest());
afterEach(() => resetEmployeesForTest());

async function setupLoaded() {
  const { result } = renderHook(() => useEmployees());
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
}

describe("useEmployees", () => {
  it("초기 직원 9명을 불러온다", async () => {
    const result = await setupLoaded();
    expect(result.current.employees).toHaveLength(9);
  });

  it("addEmployee는 새 직원을 추가한다", async () => {
    const result = await setupLoaded();

    await act(async () => {
      await result.current.addEmployee({
        name: "새 직원",
        team: "CS팀",
        role: "cs",
        positions: ["cs_manager"],
      });
    });

    expect(result.current.employees).toHaveLength(10);
    const created = result.current.employees.find((e) => e.name === "새 직원");
    expect(created?.positions).toEqual(["cs_manager"]);
    expect(created?.active).toBe(true);
  });

  it("editEmployee는 역할과 직책을 변경한다", async () => {
    const result = await setupLoaded();

    await act(async () => {
      await result.current.editEmployee("cs-manager", {
        positions: ["cs_responsible"],
      });
    });

    const updated = result.current.employees.find((e) => e.id === "cs-manager");
    expect(updated?.positions).toEqual(["cs_responsible"]);
  });

  it("removeEmployee는 계정을 삭제한다", async () => {
    const result = await setupLoaded();

    await act(async () => {
      await result.current.removeEmployee("viewer");
    });

    expect(result.current.employees.some((e) => e.id === "viewer")).toBe(false);
  });
});
