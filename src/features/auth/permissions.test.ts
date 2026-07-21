import { describe, expect, it } from "vitest";
import { canAccessPath, positionLabel } from "./permissions";

describe("canAccessPath", () => {
  it("admin은 모든 앱 경로에 접근한다", () => {
    expect(canAccessPath("admin", "/admin/users")).toBe(true);
    expect(canAccessPath("admin", "/installs")).toBe(true);
    expect(canAccessPath("admin", "/franchise-receipts")).toBe(true);
  });

  it("cs/tech/viewer 역할도 팀 구분 없이 모든 업무 경로에 접근한다", () => {
    expect(canAccessPath("cs", "/installs")).toBe(true);
    expect(canAccessPath("cs", "/franchise-receipts")).toBe(true);
    expect(canAccessPath("tech", "/franchise-receipts")).toBe(true);
    expect(canAccessPath("tech", "/installs")).toBe(true);
    expect(canAccessPath("viewer", "/installs")).toBe(true);
    expect(canAccessPath("viewer", "/franchise-receipts")).toBe(true);
  });

  it("/admin/users는 admin 역할 또는 master 직책만 접근한다", () => {
    expect(canAccessPath("cs", "/admin/users")).toBe(false);
    expect(canAccessPath("tech", "/admin/users")).toBe(false);
    expect(canAccessPath("viewer", "/admin/users")).toBe(false);
    expect(canAccessPath("admin", "/admin/users")).toBe(true);
    expect(canAccessPath("viewer", "/admin/users", ["master"])).toBe(true);
  });

  it("/activity-log는 master 직책만 접근한다 (admin 역할이어도 예외 없음)", () => {
    expect(canAccessPath("admin", "/activity-log")).toBe(false);
    expect(canAccessPath("cs", "/activity-log")).toBe(false);
    expect(canAccessPath("viewer", "/activity-log", ["master"])).toBe(true);
    expect(canAccessPath("cs", "/activity-log", ["master"])).toBe(true);
  });

  it("master 직책은 관리자 전용 경로에도 접근한다", () => {
    expect(canAccessPath("viewer", "/admin/users", ["master"])).toBe(true);
    expect(canAccessPath("viewer", "/installs", ["master"])).toBe(true);
  });
});

describe("positionLabel", () => {
  it("직책 코드를 한글 라벨로 변환한다", () => {
    expect(positionLabel("cs_manager")).toBe("CS 매니저");
    expect(positionLabel("cs_responsible")).toBe("CS 책임매니저");
    expect(positionLabel("tech_manager")).toBe("기술지원 매니저");
    expect(positionLabel("tech_responsible")).toBe("기술지원 책임매니저");
    expect(positionLabel("team_lead")).toBe("팀장");
    expect(positionLabel("master")).toBe("마스터");
  });
});
