import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { canAccessPath, type UserRole } from "@/features/auth/permissions";
import { useAuth } from "@/features/auth/auth-provider";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("@/features/auth/auth-provider", () => ({
  useAuth: vi.fn(),
}));

function mockRole(role: UserRole) {
  vi.mocked(useAuth).mockReturnValue({
    ready: true,
    user: { id: role, name: role, team: role, role },
    login: vi.fn(),
    logout: vi.fn(),
    canAccess: (pathname: string) => canAccessPath(role, pathname),
  });
}

describe("AppSidebar", () => {
  it("공통 메뉴와 역할별 메뉴가 렌더링된다", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    mockRole("admin");
    render(<AppSidebar />);

    expect(screen.getByRole("link", { name: "대시보드" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "가맹 접수" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "설치 관리" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "매장 운영 이력" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "직원 관리" })).toBeInTheDocument();
  });

  it("현재 경로와 일치하는 링크가 활성 상태로 표시된다", () => {
    vi.mocked(usePathname).mockReturnValue("/franchise-receipts");
    mockRole("cs");
    render(<AppSidebar />);

    const activeLink = screen.getByRole("link", { name: "가맹 접수" });
    expect(activeLink.className).toContain("text-primary");
  });

  it("접기 버튼 클릭 시 메뉴 라벨이 숨겨지고 펼치기 버튼으로 바뀐다", async () => {
    vi.mocked(usePathname).mockReturnValue("/");
    mockRole("admin");
    const user = userEvent.setup();
    render(<AppSidebar />);

    await user.click(screen.getByRole("button", { name: "메뉴 접기" }));

    expect(screen.queryByText("대시보드")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "대시보드" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "메뉴 펼치기" }),
    ).toBeInTheDocument();
  });

  it("CS 권한에서는 기술지원과 관리 메뉴를 숨긴다", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    mockRole("cs");
    render(<AppSidebar />);

    expect(screen.getByRole("link", { name: "가맹 접수" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "설치 관리" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "직원 관리" }),
    ).not.toBeInTheDocument();
  });
});
