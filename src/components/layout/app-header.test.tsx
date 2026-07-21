import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { AppHeader } from "./app-header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { resetNotificationsForTest } from "@/mocks/handlers";
import { useAuth } from "@/features/auth/auth-provider";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("@/features/auth/auth-provider", () => ({
  useAuth: vi.fn(),
}));

afterEach(() => resetNotificationsForTest());

function renderHeader(auth = {}) {
  vi.mocked(useAuth).mockReturnValue({
    ready: true,
    user: {
      id: "cs",
      name: "서지은 팀장",
      team: "CS팀",
      role: "cs",
      positions: [],
      active: true,
      username: "cs",
    },
    login: vi.fn(),
    logout: vi.fn(),
    canAccess: (pathname: string) =>
      ["/", "/franchise-receipts", "/changes", "/woo", "/internet"].includes(
        pathname,
      ),
    ...auth,
  });
  return render(
    <ThemeProvider>
      <AppHeader />
    </ThemeProvider>,
  );
}

describe("AppHeader", () => {
  it("header(banner 랜드마크)로 렌더링된다", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    renderHeader();
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("현재 경로에 맞는 브레드크럼을 표시한다", () => {
    vi.mocked(usePathname).mockReturnValue("/franchise-receipts");
    renderHeader();
    expect(screen.getByText("CS")).toBeInTheDocument();
    expect(screen.getByText("가맹 접수")).toBeInTheDocument();
  });

  it("알림 버튼에 읽지 않은 알림 개수가 표시된다", async () => {
    vi.mocked(usePathname).mockReturnValue("/");
    renderHeader();
    const button = await screen.findByRole("button", {
      name: "알림, 읽지 않은 알림 5개",
    });
    expect(button).toHaveTextContent("5");
  });

  it("사용자 이름과 소속이 표시된다", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    renderHeader();
    expect(screen.getByText("서지은 팀장")).toBeInTheDocument();
    expect(screen.getByText("CS팀 · CS")).toBeInTheDocument();
  });

  it("사용자 메뉴를 열면 테마 세그먼트 버튼이 있고, 선택 시 해당 테마로 전환된다", async () => {
    vi.mocked(usePathname).mockReturnValue("/");
    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByRole("button", { name: /서지은 팀장/ }));

    const lightBtn = screen.getByRole("button", { name: "라이트" });
    const darkBtn = screen.getByRole("button", { name: "다크" });
    const pinkBtn = screen.getByRole("button", { name: "핑크" });
    expect(lightBtn).toHaveAttribute("aria-pressed", "true");

    await user.click(darkBtn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(darkBtn).toHaveAttribute("aria-pressed", "true");

    await user.click(pinkBtn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("pink");
    expect(pinkBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("사용자 메뉴에서 로그아웃을 실행한다", async () => {
    vi.mocked(usePathname).mockReturnValue("/");
    const user = userEvent.setup();
    const logout = vi.fn();
    renderHeader({ logout, canAccess: () => true });

    await user.click(screen.getByRole("button", { name: /서지은 팀장/ }));
    await user.click(screen.getByRole("menuitem", { name: "로그아웃" }));

    expect(logout).toHaveBeenCalledOnce();
  });
});
