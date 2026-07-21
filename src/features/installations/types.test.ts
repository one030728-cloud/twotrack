import { describe, expect, it } from "vitest";
import {
  matchesInstallStatusTab,
  statusOptionsForKind,
  statusTabsForKind,
  techNameForUserName,
  STATUS_FLOW_BY_KIND,
  type InstallRecord,
} from "./types";

function makeInstall(overrides: Partial<InstallRecord> = {}): InstallRecord {
  return {
    id: 1,
    kind: "install",
    customerName: "카페 아모르",
    phone: "010-2231-8842",
    address: "서울 성동구",
    addressDetail: "",
    product: "카드단말기 A100",
    status: "receipt",
    assignedTech: null,
    trackingNo: null,
    scheduledDate: null,
    timeSlot: null,
    symptom: "",
    registeredBy: "서지은",
    registeredAt: "2026-07-16T09:00:00+09:00",
    source: "manual",
    memo: "",
    notiHistory: [],
    ...overrides,
  };
}

describe("statusTabsForKind / matchesInstallStatusTab", () => {
  it("구분별 상태 흐름 개수만큼 all을 제외한 탭이 생성된다", () => {
    expect(statusTabsForKind("install")).toHaveLength(
      STATUS_FLOW_BY_KIND.install.length + 1,
    );
    expect(statusTabsForKind("install")[0].key).toBe("all");
  });

  it("all 탭은 모든 상태와 매치된다", () => {
    expect(
      matchesInstallStatusTab(makeInstall({ status: "moving" }), "all"),
    ).toBe(true);
  });

  it("특정 상태 탭은 같은 상태만 매치된다", () => {
    const record = makeInstall({ status: "shipping" });
    expect(matchesInstallStatusTab(record, "shipping")).toBe(true);
    expect(matchesInstallStatusTab(record, "shipped")).toBe(false);
  });
});

describe("statusOptionsForKind", () => {
  it("구분마다 서로 다른 상태 어휘를 사용한다", () => {
    const install = statusOptionsForKind("install").map((o) => o.value);
    const parcel = statusOptionsForKind("parcel").map((o) => o.value);
    const as = statusOptionsForKind("as").map((o) => o.value);

    expect(install).toContain("installDone");
    expect(parcel).toContain("received");
    expect(as).toContain("asDone");
    expect(install).not.toContain("received");
  });
});

describe("techNameForUserName", () => {
  it("계정명이 기사 짧은 이름으로 시작하면 해당 기사명을 반환한다", () => {
    expect(techNameForUserName("박기사 매니저")).toBe("박기사");
    expect(techNameForUserName("최기사 팀장")).toBe("최기사");
  });

  it("일치하는 기사가 없으면 null을 반환한다", () => {
    expect(techNameForUserName("관리자")).toBeNull();
  });
});
