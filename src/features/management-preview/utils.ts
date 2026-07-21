import { CURRENT_CS_REP } from "@/lib/cs-representatives";
import type {
  ColumnDef,
  FieldDef,
  ManagementKind,
  PageConfig,
  RowData,
  SortDirection,
  SortState,
} from "@/features/management-preview/types";

export function getLocalIsoDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeDate(value: string | undefined): string {
  return value?.replaceAll(".", "-") ?? "";
}

export function matchesKpi(
  kind: ManagementKind,
  row: RowData,
  label: string,
  today = getLocalIsoDate(),
): boolean {
  const receivedAt = normalizeDate(
    kind === "internet" ? row.appliedAt : row.receivedAt,
  );
  const openedAt = normalizeDate(row.openedAt);

  if (label === "오늘 접수") return receivedAt === today;
  if (kind === "changes") {
    if (label === "서류 대기") return row.status === "서류대기";
    if (label === "서류 미비") return row.status === "서류미비";
    if (label === "접수 완료") return row.status === "접수완료";
  }
  if (kind === "woo") {
    if (label === "가맹 미확인") return row.merchantStatus === "가맹미확인";
    if (label === "가맹 완료") return row.merchantStatus === "가맹완료";
    if (label === "7일 내 오픈") {
      const openDate = new Date(`${normalizeDate(row.openDate)}T00:00:00`);
      const start = new Date(`${today}T00:00:00`);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return openDate >= start && openDate <= end;
    }
  }
  if (kind === "internet") {
    if (label === "개통 대기") return row.status === "접수완료";
    if (label === "오늘 개통") return openedAt === today;
    if (label === "이번 달 개통") {
      return openedAt.startsWith(today.slice(0, 7));
    }
  }
  return false;
}

export function getInitialEntryValues(): Record<string, string> {
  const values: Record<string, string> = {
    receivedAt: getLocalIsoDate(),
    appliedAt: getLocalIsoDate(),
  };
  return values;
}

export function hasRequiredValues(
  config: PageConfig,
  values: Record<string, string>,
): boolean {
  return config.sections
    .flatMap((section) => section.fields)
    .filter((field) => field.required)
    .every((field) => values[field.key]?.trim());
}

export function findField(
  config: PageConfig,
  key: string,
): FieldDef | undefined {
  return [
    ...config.sections.flatMap((section) => section.fields),
    ...(config.inlineFields ?? []),
  ].find((field) => field.key === key);
}

const STATUS_SORT_ORDER = [
  "정보입력",
  "서류대기",
  "서류미비",
  "접수완료",
  "개통완료",
] as const;

const KO_COLLATOR = new Intl.Collator("ko", {
  numeric: true,
  sensitivity: "base",
});

export function getDefaultSort(kind: ManagementKind): SortState {
  return {
    key: kind === "internet" ? "appliedAt" : "receivedAt",
    direction: "desc",
  };
}

function parseNumericValue(value: string): number {
  return Number(value.replaceAll(",", "").replace(/[^\d.-]/g, "")) || 0;
}

function parseSpeedValue(value: string): number {
  const normalized = value.trim().toUpperCase();
  const amount = Number.parseFloat(normalized);
  if (Number.isNaN(amount)) return 0;
  return normalized.endsWith("G") ? amount * 1000 : amount;
}

export function compareRows(
  first: RowData,
  second: RowData,
  column: ColumnDef,
  direction: SortDirection,
): number {
  const firstValue = first[column.key] ?? "";
  const secondValue = second[column.key] ?? "";
  const firstEmpty = !firstValue || firstValue === "-";
  const secondEmpty = !secondValue || secondValue === "-";
  if (firstEmpty !== secondEmpty) return firstEmpty ? 1 : -1;
  if (firstEmpty && secondEmpty) return 0;

  let result = 0;
  switch (column.sortType) {
    case "date":
      result = normalizeDate(firstValue).localeCompare(
        normalizeDate(secondValue),
      );
      break;
    case "number":
      result = parseNumericValue(firstValue) - parseNumericValue(secondValue);
      break;
    case "speed":
      result = parseSpeedValue(firstValue) - parseSpeedValue(secondValue);
      break;
    case "status": {
      const firstIndex = STATUS_SORT_ORDER.indexOf(
        firstValue as (typeof STATUS_SORT_ORDER)[number],
      );
      const secondIndex = STATUS_SORT_ORDER.indexOf(
        secondValue as (typeof STATUS_SORT_ORDER)[number],
      );
      result =
        (firstIndex < 0 ? STATUS_SORT_ORDER.length : firstIndex) -
        (secondIndex < 0 ? STATUS_SORT_ORDER.length : secondIndex);
      if (result === 0) result = KO_COLLATOR.compare(firstValue, secondValue);
      break;
    }
    case "text":
    default:
      result = KO_COLLATOR.compare(firstValue, secondValue);
  }

  return direction === "asc" ? result : -result;
}

export function downloadManagementCsv(
  kind: ManagementKind,
  config: PageConfig,
  rows: RowData[],
) {
  const headers = config.columns.map((column) => column.label);
  const csvRows = rows.map((row) =>
    config.columns.map((column) => row[column.key] ?? "-"),
  );
  const csv = [headers, ...csvRows]
    .map((values) =>
      values.map((value) => `"${value.replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${kind}-management-${getLocalIsoDate()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function matchesTab(
  row: RowData,
  tab: string,
  config: PageConfig,
): boolean {
  if (tab === "전체") return true;
  if (tab === "내 업무") return row.manager === CURRENT_CS_REP;
  if (tab === "가맹미확인") return row.merchantStatus === "가맹미확인";
  return row[config.tabField] === tab;
}
