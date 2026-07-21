"use client";

import Link from "next/link";
import { BellIcon } from "lucide-react";

import { useNotifications } from "@/hooks/use-notifications";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { IconButton } from "@/components/ui/icon-button";
import { Popover, PopoverPanel } from "@/components/ui/popover";

export function NotificationsPopover() {
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications();

  return (
    <Popover>
      {({ open, toggle, close, panelId }) => (
        <>
          <IconButton
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={toggle}
            aria-label={
              unreadCount > 0 ? `알림, 읽지 않은 알림 ${unreadCount}개` : "알림"
            }
            className="relative"
          >
            <BellIcon className="size-4" />
            {unreadCount > 0 && (
              <span className="bg-error absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-[3px] text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </IconButton>
          {open && (
            <PopoverPanel
              id={panelId}
              align="end"
              role="dialog"
              aria-label="알림 목록"
              className="w-[340px] py-0"
            >
              <div className="border-border flex items-center justify-between border-b px-3.5 py-3">
                <span className="text-foreground text-sm font-semibold">
                  알림
                </span>
                <button
                  type="button"
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  className="text-primary disabled:text-muted-foreground text-xs font-semibold disabled:cursor-not-allowed"
                >
                  모두 읽음으로 표시
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-muted-foreground px-3.5 py-6 text-center text-sm">
                    새 알림이 없습니다
                  </p>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link}
                      onClick={() => {
                        markRead(n.id);
                        close();
                      }}
                      className="hover:bg-muted flex items-start gap-2.5 px-3.5 py-2.5 text-sm"
                    >
                      <span
                        aria-hidden="true"
                        className={[
                          "mt-1.5 size-1.5 shrink-0 rounded-full",
                          n.read ? "bg-transparent" : "bg-primary",
                        ].join(" ")}
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={
                            n.read
                              ? "text-muted-foreground"
                              : "text-foreground font-medium"
                          }
                        >
                          {n.message}
                        </span>
                        <span className="text-muted-foreground mt-0.5 block text-xs">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </PopoverPanel>
          )}
        </>
      )}
    </Popover>
  );
}
