import { describe, expect, it } from "vitest";
import { canAccessPath, positionLabel } from "./permissions";

describe("canAccessPath", () => {
  it("admin은 모든 앱 경로에 접근한다", () => {
    expect(canAccessPath("admin", "/admin/users")).toBe(true);
    expect(canAccessPath("admin", "/installs")).toBe(true);
    expect(canAccessPath("admin", "/franchise-receipts")).toBe(true);
  });

  it("cs는 CS 업무 경로만 접근한다", () => {
    expect(canAccessPath("cs", "/franchise-receipts")).toBe(true);
    expect(canAccessPath("cs", "/changes")).toBe(true);
    expect(canAccessPath("cs", "/installs")).toBe(false);
    expect(canAccessPath("cs", "/admin/users")).toBe(false);
  });

  it("tech는 기술지원 경로만 접근한다", () => {
    expect(canAccessPath("tech", "/installs")).toBe(true);
    expect(canAccessPath("tech", "/stores")).toBe(true);
    expect(canAccessPath("tech", "/franchise-receipts")).toBe(false);
  });
});

describe("positionLabel", () => {
  it("직책 코드를 한글 라벨로 변환한다", () => {
    expect(positionLabel("manager")).toBe("매니저");
    expect(positionLabel("responsible_manager")).toBe("책임매니저");
    expect(positionLabel("team_lead")).toBe("팀장");
  });
});
