import {
  INSTALL_KIND_META,
  INSTALL_KIND_ORDER,
  type InstallKind,
} from "@/features/installations/types";

interface KindSwitchProps {
  kind: InstallKind;
  onChange: (kind: InstallKind) => void;
}

/**
 * 설치/택배발송/AS를 필터가 아니라 개별 페이지 탭처럼 보이게 하는 것이 목적이라
 * 전체 옵션이나 건수 배지 없이, 세 구분만 제목 크기 글씨로 나열한다.
 */
export function KindSwitch({ kind, onChange }: KindSwitchProps) {
  return (
    <div
      role="tablist"
      aria-label="설치관리 구분"
      className="flex flex-wrap items-baseline gap-x-3"
    >
      {INSTALL_KIND_ORDER.map((key, i) => {
        const active = key === kind;
        return (
          <span key={key} className="flex items-baseline gap-3">
            {i > 0 && (
              <span
                aria-hidden="true"
                className="text-border text-xl font-bold"
              >
                ·
              </span>
            )}
            <button
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(key)}
              className={[
                "text-2xl font-bold tracking-tight whitespace-nowrap transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground/50 hover:text-muted-foreground",
              ].join(" ")}
            >
              {INSTALL_KIND_META[key].label}
            </button>
          </span>
        );
      })}
    </div>
  );
}
