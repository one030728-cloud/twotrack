"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { LogoMark } from "@/components/layout/logo-mark";
import { navItems } from "@/components/layout/nav-items";
import { useAuth } from "@/features/auth/auth-provider";

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { canAccess } = useAuth();
  const visibleItems = navItems
    .map((item) => {
      if (!item.children) return item.url && canAccess(item.url) ? item : null;
      const children = item.children.filter((child) => canAccess(child.url));
      return children.length > 0 ? { ...item, children } : null;
    })
    .filter((item): item is (typeof navItems)[number] => item !== null);

  return (
    <aside
      className={`bg-card border-border shadow-sidebar flex h-dvh shrink-0 flex-col border-r transition-[width] duration-150 ${
        collapsed ? "w-[70px]" : "w-[244px]"
      }`}
    >
      <div
        className={`flex h-[58px] shrink-0 items-center gap-2 border-b border-[color-mix(in_oklab,var(--border)_60%,transparent)] px-4 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <Link
          href="/"
          aria-label="POSMOS 홈"
          className="flex min-w-0 items-center gap-2"
        >
          <LogoMark className="size-7 shrink-0" />
          {!collapsed && (
            <span className="text-foreground truncate text-base font-bold tracking-tight">
              POSMOS
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="메뉴 접기"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-6 shrink-0 items-center justify-center rounded-md"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="메뉴 펼치기"
          className="text-muted-foreground hover:bg-muted hover:text-foreground border-border flex h-9 shrink-0 items-center justify-center border-b"
        >
          <ChevronRightIcon className="size-4" />
        </button>
      )}

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {visibleItems.map((item) => {
          if (!item.children) {
            const isActive = pathname === item.url;
            return (
              <Link
                key={item.title}
                href={item.url ?? "#"}
                className={`flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-primary-muted text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="size-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            );
          }

          return (
            <div
              key={item.title}
              className={`mb-1 ${item.separator ? "border-border mt-1 border-t pt-1" : ""}`}
            >
              {!collapsed && !item.hideTitle && (
                <div className="text-muted-foreground px-2.5 pt-1.5 pb-1.5 text-[11px] font-semibold tracking-wide">
                  {item.title}
                </div>
              )}
              {item.children.map((child) => {
                const isActive = pathname === child.url;
                const ChildIcon = child.icon;
                return (
                  <Link
                    key={child.title}
                    href={child.url}
                    className={`flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm ${
                      collapsed ? "justify-center" : ""
                    } ${
                      isActive
                        ? "bg-primary-muted text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    title={collapsed ? child.title : undefined}
                  >
                    <ChildIcon className="size-[18px] shrink-0" />
                    {!collapsed && (
                      <span className="truncate">{child.title}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
