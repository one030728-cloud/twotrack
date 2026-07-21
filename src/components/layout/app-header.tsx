"use client";

import { usePathname } from "next/navigation";
import {
  ChevronDownIcon,
  LogOutIcon,
  MoonIcon,
  PaletteIcon,
  SunIcon,
} from "lucide-react";

import { navItems } from "@/components/layout/nav-items";
import { useTheme, type Theme } from "@/components/theme/theme-provider";
import { Popover, PopoverItem, PopoverPanel } from "@/components/ui/popover";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { useAuth } from "@/features/auth/auth-provider";
import { roleLabel } from "@/features/auth/permissions";

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof SunIcon }[] = [
  { value: "light", label: "라이트", icon: SunIcon },
  { value: "dark", label: "다크", icon: MoonIcon },
  { value: "pink", label: "핑크", icon: PaletteIcon },
];

function useBreadcrumb(canAccess: (pathname: string) => boolean) {
  const pathname = usePathname();
  for (const item of navItems) {
    if (item.url === pathname && canAccess(item.url)) {
      return [item.title];
    }
    const child = item.children?.find(
      (c) => c.url === pathname && canAccess(c.url),
    );
    if (child) {
      return [item.title, child.title];
    }
  }
  return ["대시보드"];
}

export function AppHeader() {
  const { user, logout, canAccess } = useAuth();
  const breadcrumb = useBreadcrumb(canAccess);
  const { theme, setTheme } = useTheme();
  const initials = user?.name.slice(0, 1) ?? "?";

  return (
    <header className="bg-card border-border flex h-[58px] shrink-0 items-center justify-between border-b px-6">
      <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
        {breadcrumb.map((label, idx) => (
          <span key={label} className="flex items-center gap-1.5">
            {idx > 0 && <span>/</span>}
            <span
              className={
                idx === breadcrumb.length - 1
                  ? "text-foreground font-semibold"
                  : undefined
              }
            >
              {label}
            </span>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <NotificationsPopover />

        <div className="bg-border mx-1 h-5.5 w-px" />

        <Popover>
          {({ open, toggle, close, panelId }) => (
            <>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={toggle}
                className="flex items-center gap-2"
              >
                <div className="from-primary-muted to-primary/30 text-primary flex size-[34px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold">
                  {initials}
                </div>
                <div className="text-left leading-tight">
                  <div className="text-foreground text-sm font-semibold">
                    {user?.name}
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    {user?.team} · {user ? roleLabel(user.role) : ""}
                  </div>
                </div>
                <ChevronDownIcon className="text-muted-foreground size-3.5" />
              </button>
              {open && (
                <PopoverPanel id={panelId} align="end" role="menu">
                  <div className="border-border border-b px-3.5 py-3">
                    <div className="text-foreground text-sm font-semibold">
                      {user?.name}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {user?.team} · {user ? roleLabel(user.role) : ""}
                    </div>
                  </div>
                  <div className="px-3.5 py-3">
                    <div className="text-muted-foreground mb-2 text-xs font-medium">
                      테마
                    </div>
                    <div
                      role="group"
                      aria-label="테마 선택"
                      className="border-border bg-muted flex gap-1 rounded-lg border p-1"
                    >
                      {THEME_OPTIONS.map((opt) => {
                        const active = theme === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setTheme(opt.value)}
                            className={[
                              "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold",
                              active
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                            ].join(" ")}
                          >
                            <opt.icon className="size-3.5" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="border-border my-1 border-t" />
                  <PopoverItem
                    onClick={() => {
                      logout();
                      close();
                    }}
                  >
                    <LogOutIcon className="size-4" />
                    로그아웃
                  </PopoverItem>
                </PopoverPanel>
              )}
            </>
          )}
        </Popover>
      </div>
    </header>
  );
}
