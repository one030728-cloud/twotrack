"use client";

import { type MouseEvent, type ReactNode } from "react";
import { useSnackbar } from "@/components/ui/snackbar";

interface CopyableTextProps {
  value: string;
  label: string;
  children?: ReactNode;
  className?: string;
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function CopyableText({
  value,
  label,
  children,
  className,
}: CopyableTextProps) {
  const { showSnackbar } = useSnackbar();

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await copyText(value);
    showSnackbar(`${label} 복사됨`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={`${label} 클릭하여 복사`}
      className={
        className ??
        "text-foreground hover:text-primary focus-visible:ring-primary/30 rounded-sm text-left underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
      }
    >
      {children ?? value}
    </button>
  );
}
