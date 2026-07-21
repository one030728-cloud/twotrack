import type { ButtonHTMLAttributes } from "react";

type IconButtonSize = "sm" | "md";

const sizes: Record<IconButtonSize, string> = {
  sm: "size-[30px]",
  md: "size-[34px]",
};

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 아이콘만 있는 버튼이므로 스크린 리더용 라벨은 필수다. */
  "aria-label": string;
  size?: IconButtonSize;
}

export function IconButton({
  size = "md",
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={[
        "border-border text-muted-foreground hover:bg-muted focus-visible:ring-primary/30 flex shrink-0 items-center justify-center rounded-lg border outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
        sizes[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
