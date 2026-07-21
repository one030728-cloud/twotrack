"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import {
  fetchChatMessages,
  sendChatMessage,
} from "@/features/chat/api/chat-api";
import type { ChatMessage } from "@/features/chat/types";

export function useChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchChatMessages().then((data) => {
      if (cancelled) return;
      setMessages(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const sendMessage = useCallback(
    async (channelId: string, content: string) => {
      if (!user) return null;
      const created = await sendChatMessage({
        channelId,
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
