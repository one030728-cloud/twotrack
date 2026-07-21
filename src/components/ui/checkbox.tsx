import { forwardRef, useId, type InputHTMLAttributes } from "react";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, id, className, ...props }, ref) {
    const generatedId = useId();
    const checkboxId = id ?? generatedId;

    const input = (
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        className={["accent-primary size-[15px] cursor-pointer", className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    );

    if (!label) return input;

    return (
      <label
        htmlFor={checkboxId}
        className="text-foreground flex cursor-pointer items-center gap-2 text-sm select-none"
      >
        {input}
        {label}
      </label>
    );
  },
);
