"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import {
  fetchSlackMessages,
  sendSlackMessage,
} from "@/features/slack/api/slack-api";
import type { SlackChannel, SlackMessageRecord } from "@/features/slack/types";

export function useSlack() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<SlackMessageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchSlackMessages().then((data) => {
      if (cancelled) return;
      setMessages(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const sendMessage = useCallback(
    async (channel: SlackChannel, content: string) => {
      if (!user) return null;
      const created = await sendSlackMessage({
        channel,
        content,
        actorId: user.id,
      });
      setMessages((prev) => [...prev, created]);
      return created;
    },
    [user],
  );

  return {
    loading,
    messages,
    sendMessage,
  };
}
