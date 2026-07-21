"use client";

import { useEffect, useState } from "react";
import { fetchActivityLog } from "@/features/activity-log/api/activity-log-api";
import type { ActivityLogEntry } from "@/features/activity-log/types";

export function useActivityLog() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchActivityLog().then((data) => {
      if (cancelled) return;
      setEntries(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, entries };
}
