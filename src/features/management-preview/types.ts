import type { LucideIcon } from "lucide-react";

export type ManagementKind = "changes" | "woo" | "internet";
export type RowData = Record<string, string> & {
  id: string;
  memoCount: string;
};

export type SortType = "text" | "date" | "number" | "status" | "speed";
export type SortDirection = "asc" | "desc";

export interface ColumnDef {
  key: string;
  label: string;
  kind?: "badge" | "money" | "memo" | "identity";
  initialWidth: number;
  minWidth: number;
  sortType?: SortType;
  resizable?: boolean;
}

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface FilterDef {
  key: string;
  label: string;
  type?: "select" | "dateRange";
  options?: string[];
}

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "date" | "dateText" | "select" | "textarea" | "money";
  options?: string[];
  placeholder?: string;
  required?: boolean;
  span?: 1 | 2;
  width?: "wide";
  format?: "default" | "raw";
}

export interface SectionDef {
  title: string;
  fields: FieldDef[];
}

export interface KpiDef {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "blue" | "amber" | "red" | "green";
}

export interface PageConfig {
  title: string;
  description: string;
  createLabel: string;
  searchPlaceholder: string;
  kpis: KpiDef[];
  tabs: string[];
  tabField: string;
  filters: FilterDef[];
  columns: ColumnDef[];
  sections: SectionDef[];
  inlineFields?: FieldDef[];
  inlineEditKeys: string[];
  rows: RowData[];
}
