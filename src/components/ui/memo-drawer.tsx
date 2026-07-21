"use client";

import { useId, useMemo, useState } from "react";
import { ArrowUpIcon, PinIcon, Trash2Icon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export type MemoItemType = "메모" | "변경 이력";

export interface MemoItem {
  id: string;
  type: MemoItemType;
  meta: string;
  content: string;
  pinned?: boolean;
  removable?: boolean;
}

interface MemoDrawerProps {
  subject: string;
  description?: string;
  items: MemoItem[];
  onClose: () => void;
  onAdd: (content: string) => void;
  onTogglePin?: (id: string) => void;
  onRemove?: (id: string) => void;
}

function normalizeMetaDateTime(value: string): string {
  const normalized = value.trim().replaceAll("-", ".");
  if (/^\d{4}\.\d{2}\.\d{2}\s\d{2}:\d{2}:\d{2}$/.test(normalized)) {
    return normalized;
  }
  if (/^\d{4}\.\d{2}\.\d{2}\s\d{2}:\d{2}$/.test(normalized)) {
    return `${normalized}:00`;
  }
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(normalized)) {
    return `${normalized} 00:00:00`;
  }
  return normalized;
}

function splitMeta(meta: string): { dateTime: string; author?: string } {
  const [dateTime, author] = meta.split("·").map((part) => part.trim());
  return {
    dateTime: normalizeMetaDateTime(dateTime),
    author,
  };
}

export function MemoDrawer({
  subject,
  description,
  items,
  onClose,
  onAdd,
  onTogglePin,
  onRemove,
}: MemoDrawerProps) {
  const titleId = useId();
  const [tab, setTab] = useState<"전체" | MemoItemType>("전체");
  const [draft, setDraft] = useState("");
  const visible = useMemo(() => {
    const sorted = [...items].sort(
      (first, second) => Number(second.pinned) - Number(first.pinned),
    );
    return tab === "전체" ? sorted : sorted.filter((item) => item.type === tab);
  }, [items, tab]);

  const submit = () => {
    const content = draft.trim();
    if (!content) return;
    onAdd(content);
    setDraft("");
  };

  return (
    <Dialog
      open
      onClose={onClose}
      variant="drawer"
      labelledBy={titleId}
      className="flex flex-col"
    >
      <div className="border-border flex items-start justify-between border-b px-6 py-5">
        <div>
          <h2 id={titleId} className="text-lg font-bold">
            {subject}
          </h2>
          {description && (
            <p className="text-muted-foreground mt-1 text-[13.5px]">
              {description}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" aria-label="닫기" onClick={onClose}>
          <XIcon className="size-4" />
        </Button>
      </div>
      <div className="border-border flex gap-1 border-b px-6 pt-2">
        {(["전체", "메모", "변경 이력"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={[
              "border-b-2 px-3 py-3 text-sm font-semibold",
              tab === item
                ? "border-primary text-primary"
                : "text-muted-foreground border-transparent",
            ].join(" ")}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {visible.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center text-sm">
            등록된 {tab === "전체" ? "메모" : tab}가 없습니다.
          </p>
        ) : (
          <div className="space-y-3">
            {visible.map((item) => {
              const meta = splitMeta(item.meta);
              return (
                <article
                  key={item.id}
                  className={[
                    "group rounded-lg border py-3 pr-3.5 pl-4 transition-colors",
                    item.type === "메모"
                      ? "border-primary/15 bg-primary-muted/35"
                      : "border-border bg-card",
                    item.pinned ? "border-primary/30 shadow-sm" : "",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <Badge
                        size="sm"
                        tone={item.type === "메모" ? "primary" : "neutral"}
                      >
                        {item.type}
                      </Badge>
                      <span className="text-muted-foreground font-mono text-xs tabular-nums">
                        {meta.dateTime}
                      </span>
                      {meta.author && (
                        <span className="text-muted-foreground text-xs">
                          {meta.author}
                        </span>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {onTogglePin && (
                        <button
                          type="button"
                          aria-label={item.pinned ? "고정 해제" : "고정"}
                          aria-pressed={!!item.pinned}
                          onClick={() => onTogglePin(item.id)}
                          className={[
                            item.pinned
                              ? "text-primary opacity-100"
                              : "text-muted-foreground opacity-40 group-hover:opacity-100",
                            "transition-opacity",
                          ].join(" ")}
                        >
                          <PinIcon
                            className="size-3.5"
                            fill={item.pinned ? "currentColor" : "none"}
                          />
                        </button>
                      )}
                      {onRemove &&
                        item.type === "메모" &&
                        item.removable !== false && (
                          <button
                            type="button"
                            aria-label="삭제"
                            onClick={() => onRemove(item.id)}
                            className="text-muted-foreground hover:text-error opacity-40 transition-opacity group-hover:opacity-100"
                          >
                            <Trash2Icon className="size-3.5" />
                          </button>
                        )}
                    </div>
                  </div>
                  <p className="text-foreground mt-2 text-[15px] leading-6 break-words">
                    {item.content}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <div className="border-border border-t p-5">
        <div className="relative">
          <Textarea
            label="메모 입력"
            hideLabel
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="메모를 입력하고 Enter로 등록"
            rows={2}
            className="rounded-xl pr-12"
          />
          <button
            type="button"
            aria-label="메모 등록"
            onClick={submit}
            disabled={!draft.trim()}
            className="bg-primary text-primary-foreground absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full disabled:opacity-40"
          >
            <ArrowUpIcon className="size-4" />
          </button>
        </div>
      </div>
    </Dialog>
  );
}
