"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppNotification } from "@/types/notification";

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/notifications")
      .then((res) => res.json() as Promise<AppNotification[]>)
      .then((data) => {
        if (cancelled) return;
        setNotifications(data);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    fetch("/api/notifications/read-all", { method: "POST" });
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, loading, unreadCount, markRead, markAllRead };
}
