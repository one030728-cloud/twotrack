"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";

export interface PopoverRenderProps {
  open: boolean;
  toggle: () => void;
  close: () => void;
  panelId: string;
}

export interface PopoverProps {
  children: (ctx: PopoverRenderProps) => ReactNode;
  className?: string;
}

// 트리거/패널 위치는 소비자가 자유롭게 구성하도록 render-prop으로 제공하고,
// 이 컴포넌트는 열림 상태와 바깥 클릭/Esc 닫힘만 책임진다.
export function Popover({ children, className }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={["relative inline-block", className].filter(Boolean).join(" ")}
    >
      {children({
        open,
        toggle: () => setOpen((v) => !v),
        close: () => setOpen(false),
        panelId,
      })}
    </div>
  );
}

export interface PopoverPanelProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  align?: "start" | "end";
}

export function PopoverPanel({
  id,
  align = "end",
  className,
  children,
  ...props
}: PopoverPanelProps) {
  return (
    <div
      id={id}
      className={[
        "border-border bg-card text-foreground absolute top-[calc(100%+8px)] z-40 min-w-[220px] overflow-hidden rounded-xl border py-1.5 shadow-lg",
        align === "end" ? "right-0" : "left-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function PopoverItem({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      role="menuitem"
      className={[
        "text-foreground hover:bg-muted flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
