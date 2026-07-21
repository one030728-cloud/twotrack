import { forwardRef, useId, type TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hideLabel?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, hideLabel, id, className, ...props }, ref) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className={hideLabel ? "sr-only" : "text-muted-foreground text-xs"}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={[
            "border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-primary w-full resize-none rounded-lg border p-3 text-sm outline-none",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
      </div>
    );
  },
);
