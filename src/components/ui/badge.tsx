import type { HTMLAttributes } from "react";

export type BadgeTone = "neutral" | "error" | "primary";
export type BadgeSize = "sm" | "md";

const toneStyles: Record<BadgeTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  error: "bg-error/15 text-error",
  primary: "bg-primary-muted text-primary",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "rounded px-1.5 py-0.5 text-[10px]",
  md: "rounded-md px-2 py-1 text-xs",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: BadgeSize;
}

export function Badge({
  tone = "neutral",
  size = "md",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center font-semibold",
        sizeStyles[size],
        toneStyles[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
