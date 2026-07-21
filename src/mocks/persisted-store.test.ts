import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { asArray, loadPersistedDb, savePersistedDb } from "./persisted-store";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("persisted-store", () => {
  it("저장된 값이 없으면 빈 객체를 반환한다", () => {
    expect(loadPersistedDb()).toEqual({});
  });

  it("저장한 값을 그대로 불러온다", () => {
    savePersistedDb({ installs: [{ id: 1 }], receipts: [] });
    expect(loadPersistedDb()).toEqual({ installs: [{ id: 1 }], receipts: [] });
  });

  it("손상된 JSON이 저장되어 있으면 빈 객체로 대체한다", () => {
    window.localStorage.setItem("posmos-mock-db:v1", "{not-json");
    expect(loadPersistedDb()).toEqual({});
  });

  describe("asArray", () => {
    it("배열이면 그대로 반환한다", () => {
      expect(asArray([1, 2, 3], () => [])).toEqual([1, 2, 3]);
    });

    it("배열이 아니면 fallback을 사용한다", () => {
      expect(asArray("not-an-array", () => [9])).toEqual([9]);
      expect(asArray(undefined, () => [9])).toEqual([9]);
    });
  });
});
