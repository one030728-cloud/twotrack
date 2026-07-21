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

  it("team_lead 직책을 가진 cs 계정은 기술지원 경로에도 접근한다", () => {
    expect(canAccessPath("cs", "/installs", ["team_lead"])).toBe(true);
    expect(canAccessPath("cs", "/franchise-receipts", ["team_lead"])).toBe(
      true,
    );
  });

  it("master 직책은 역할과 무관하게 모든 경로에 접근한다", () => {
    expect(canAccessPath("viewer", "/admin/users", ["master"])).toBe(true);
    expect(canAccessPath("viewer", "/installs", ["master"])).toBe(true);
  });

  it("직책이 없으면 기존 역할 기준 접근만 허용된다", () => {
    expect(canAccessPath("cs", "/installs", ["cs_manager"])).toBe(false);
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
