import type {
  InstallStatusTabDef,
  InstallStatusTabKey,
} from "@/features/installations/types";

interface InstallStatusTabsProps {
  tabs: InstallStatusTabDef[];
  activeTab: InstallStatusTabKey;
  tabCounts: Record<InstallStatusTabKey, number>;
  onChange: (tab: InstallStatusTabKey) => void;
}

export function InstallStatusTabs({
  tabs,
  activeTab,
  tabCounts,
  onChange,
}: InstallStatusTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="설치관리 상태 필터"
      className="flex items-center gap-1"
    >
      {tabs.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={[
              "-mb-px flex items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-sm whitespace-nowrap",
              active
                ? "border-primary text-primary font-bold"
                : "text-muted-foreground border-transparent font-medium",
            ].join(" ")}
          >
            <span>{tab.label}</span>
            <span
              className={[
                "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11.5px] leading-none font-bold",
                active
                  ? "bg-primary-muted text-primary"
                  : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {tabCounts[tab.key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
