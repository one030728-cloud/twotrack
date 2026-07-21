interface CountTabItem<Key extends string> {
  key: Key;
  label: string;
}

interface CountTabsProps<Key extends string> {
  items: CountTabItem<Key>[];
  activeKey: Key;
  counts: Record<Key, number>;
  ariaLabel: string;
  onChange: (key: Key) => void;
}

export function CountTabs<Key extends string>({
  items,
  activeKey,
  counts,
  ariaLabel,
  onChange,
}: CountTabsProps<Key>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex items-center gap-1"
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`${item.label} ${counts[item.key] ?? 0}건`}
            onClick={() => onChange(item.key)}
            className={[
              "-mb-px flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-sm whitespace-nowrap",
              active
                ? "border-primary text-primary font-bold"
                : "text-muted-foreground border-transparent font-medium",
            ].join(" ")}
          >
            <span>{item.label}</span>
            <span
              className={[
                "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11.5px] leading-none font-bold",
                active
                  ? "bg-primary-muted text-primary"
                  : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {counts[item.key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
