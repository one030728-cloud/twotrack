"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";

type DialogVariant = "modal" | "drawer";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  variant?: DialogVariant;
  /** aria-labelledby로 연결할 제목 엘리먼트의 id */
  labelledBy: string;
  children: ReactNode;
  className?: string;
}

const variantClassName: Record<DialogVariant, string> = {
  modal:
    "fixed inset-0 m-auto max-h-[90vh] w-[820px] max-w-[calc(100vw-48px)] rounded-2xl p-0",
  drawer:
    "fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-[560px] max-w-[calc(100vw-32px)] rounded-none p-0",
};

// 네이티브 <dialog>는 포커스 트랩, Esc 닫기, ::backdrop을 브라우저가
// 기본 제공하므로 커스텀 구현 없이 접근성을 확보할 수 있다.
export function Dialog({
  open,
  onClose,
  variant = "modal",
  labelledBy,
  children,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const handleBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClick={handleBackdropClick}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className={[
        "bg-card text-foreground shadow-2xl backdrop:bg-slate-900/35 open:flex open:flex-col",
        variantClassName[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </dialog>
  );
}
