"use client";

import { forwardRef, useId } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import * as RadixSelect from "@radix-ui/react-select";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  hideLabel?: boolean;
  options: SelectOption[];
  value?: string | null;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  disablePortal?: boolean;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  function Select(
    {
      label,
      hideLabel,
      options,
      value,
      onValueChange,
      placeholder,
      className,
      contentClassName,
      disabled,
      disablePortal,
    },
    ref,
  ) {
    const selectId = useId();
    const labelId = `${selectId}-label`;

    const content = (
      <RadixSelect.Content
        position="popper"
        sideOffset={4}
        className={[
          "border-border bg-card text-foreground relative z-50 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border py-1.5 shadow-lg",
          contentClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <RadixSelect.Viewport>
          {options.map((opt) => (
            <RadixSelect.Item
              key={opt.value}
              value={opt.value}
              className="hover:bg-muted data-[highlighted]:bg-muted data-[state=checked]:text-primary flex cursor-pointer items-center justify-between gap-2 px-3.5 py-2 text-sm outline-none"
            >
              <RadixSelect.ItemText>
                <span className="block truncate">{opt.label}</span>
              </RadixSelect.ItemText>
              <RadixSelect.ItemIndicator>
                <CheckIcon aria-hidden="true" className="size-3.5" />
              </RadixSelect.ItemIndicator>
            </RadixSelect.Item>
          ))}
        </RadixSelect.Viewport>
      </RadixSelect.Content>
    );

    return (
      <div className="flex w-full min-w-0 flex-col gap-1.5">
        {label && (
          <label
            id={labelId}
            htmlFor={selectId}
            className={hideLabel ? "sr-only" : "text-muted-foreground text-xs"}
          >
            {label}
          </label>
        )}
        <RadixSelect.Root
          value={value ?? undefined}
          onValueChange={onValueChange}
          disabled={disabled}
        >
          <RadixSelect.Trigger
            ref={ref}
            id={selectId}
            aria-labelledby={label ? labelId : undefined}
            className={[
              "group border-border bg-card text-foreground focus-visible:border-primary data-[state=open]:border-primary flex h-9 w-full items-center justify-between gap-2 rounded-lg border px-3 text-sm outline-none disabled:pointer-events-none disabled:opacity-50",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <RadixSelect.Value className="truncate" placeholder={placeholder} />
            <RadixSelect.Icon>
              <ChevronDownIcon
                aria-hidden="true"
                className="text-muted-foreground size-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180"
              />
            </RadixSelect.Icon>
          </RadixSelect.Trigger>
          {disablePortal ? (
            content
          ) : (
            <RadixSelect.Portal>{content}</RadixSelect.Portal>
          )}
        </RadixSelect.Root>
      </div>
    );
  },
);
