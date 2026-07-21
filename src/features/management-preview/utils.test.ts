import { describe, expect, it } from "vitest";
import { configs } from "@/features/management-preview/config";
import type { ColumnDef, RowData } from "@/features/management-preview/types";
import {
  compareRows,
  getInitialEntryValues,
  hasRequiredValues,
  matchesKpi,
  matchesTab,
  normalizeDate,
} from "@/features/management-preview/utils";

describe("management-preview utils", () => {
  it("날짜 문자열을 입력 컴포넌트 형식으로 정규화한다", () => {
    expect(normalizeDate("2026.07.16")).toBe("2026-07-16");
    expect(normalizeDate(undefined)).toBe("");
  });

  it("메뉴별 KPI 조건을 판정한다", () => {
    expect(
      matchesKpi(
        "changes",
        { id: "1", memoCount: "0", receivedAt: "2026.07.17" },
        "오늘 접수",
        "2026-07-17",
      ),
    ).toBe(true);
    expect(
      matchesKpi(
        "woo",
        { id: "2", memoCount: "0", openDate: "2026.07.24" },
        "7일 내 오픈",
        "2026-07-17",
      ),
    ).toBe(true);
    expect(
      matchesKpi(
        "internet",
        { id: "3", memoCount: "0", openedAt: "2026.07.16" },
        "이번 달 개통",
        "2026-07-17",
      ),
    ).toBe(true);
  });

  it("쉼표가 포함된 숫자와 속도 값을 실제 크기로 정렬한다", () => {
    const feeColumn: ColumnDef = {
      key: "monthlyFee",
      label: "월요금",
      initialWidth: 100,
      minWidth: 80,
      sortType: "number",
    };
    const speedColumn: ColumnDef = {
      key: "speed",
      label: "속도",
      initialWidth: 100,
      minWidth: 80,
      sortType: "speed",
    };

    expect(
      compareRows(
        { id: "1", memoCount: "0", monthlyFee: "44,000" },
        { id: "2", memoCount: "0", monthlyFee: "19,800" },
        feeColumn,
        "asc",
      ),
    ).toBeGreaterThan(0);
    expect(
      compareRows(
        { id: "1", memoCount: "0", speed: "1G" },
        { id: "2", memoCount: "0", speed: "500M" },
        speedColumn,
        "asc",
      ),
    ).toBeGreaterThan(0);
  });

  it("등록 초기값과 필수값 여부를 config 기준으로 계산한다", () => {
    const config = configs.changes;
    const initialValues = getInitialEntryValues();

    expect(initialValues.changeType).toBeUndefined();
    expect(initialValues.manager).toBeUndefined();
    expect(hasRequiredValues(config, initialValues)).toBe(true);

    expect(
      hasRequiredValues(config, {
        ...initialValues,
        name: "테스트 상점",
        owner: "홍길동",
        phone: "010-0000-0000",
      }),
    ).toBe(true);
  });

  it("탭 조건은 현재 담당자와 메뉴별 tabField를 따른다", () => {
    const row: RowData = {
      id: "1",
      memoCount: "0",
      manager: "서지은",
      status: "서류대기",
    };

    expect(matchesTab(row, "내 업무", configs.changes)).toBe(true);
    expect(matchesTab(row, "서류대기", configs.changes)).toBe(true);
    expect(matchesTab(row, "접수완료", configs.changes)).toBe(false);
  });
});
