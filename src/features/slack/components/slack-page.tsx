"use client";

import { useMemo, useState } from "react";
import { HashIcon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { useAuth } from "@/features/auth/auth-provider";
import { useSlack } from "@/features/slack/hooks/use-slack";
import { SLACK_CHANNELS, type SlackChannel } from "@/features/slack/types";

export function SlackPage() {
  const { user } = useAuth();
  const { loading, messages, sendMessage } = useSlack();
  const [channel, setChannel] = useState<SlackChannel>(SLACK_CHANNELS[0]);
  const [draft, setDraft] = useState("");

  const channelMessages = useMemo(
    () =>
      messages
        .filter((m) => m.channel === channel)
        .sort((a, b) => a.sentAt.localeCompare(b.sentAt)),
    [messages, channel],
  );

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    await sendMessage(channel, trimmed);
    setDraft("");
  };

  return (
    <PageShell className="gap-4">
      <PageHeader
        title="Slack"
        description="가맹·기술지원 채널의 Slack 메시지를 확인하고 전달합니다."
      />

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[200px_1fr]">
        <aside className="border-border bg-card overflow-hidden rounded-lg border">
          {SLACK_CHANNELS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChannel(c)}
              className={[
                "border-border flex w-full items-center gap-2 border-b px-4 py-3 text-left text-sm last:border-b-0",
                c === channel
                  ? "bg-primary-muted text-primary font-semibold"
                  : "text-foreground hover:bg-surface-subtle",
              ].join(" ")}
            >
              <HashIcon className="size-3.5 shrink-0" />
              <span className="truncate">{c.replace("#", "")}</span>
            </button>
          ))}
        </aside>

        <div className="border-border bg-card flex min-h-[520px] flex-col overflow-hidden rounded-lg border">
          <div className="border-border border-b px-4 py-3">
            <div className="text-foreground text-sm font-bold">{channel}</div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {loading ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                불러오는 중입니다.
              </p>
            ) : channelMessages.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                아직 메시지가 없습니다.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {channelMessages.map((message) => (
                  <li key={message.id} className="flex flex-col gap-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-foreground text-sm font-bold">
                        {message.senderName}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {message.sentAt.slice(0, 16).replace("T", " ")}
                      </span>
                    </div>
                    <p className="text-foreground text-sm">{message.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-border flex items-center gap-2 border-t p-3">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={!user}
              placeholder={
                user ? `${channel}에 메시지 보내기` : "로그인이 필요합니다"
              }
              aria-label="Slack 메시지 입력"
              className="border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-primary h-9 flex-1 rounded-lg border px-3 text-sm outline-none"
            />
            <Button
              variant="primary"
              disabled={!user || !draft.trim()}
              onClick={handleSend}
            >
              <SendIcon className="size-3.5" />
              전송
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
