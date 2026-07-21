"use client";

import {
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export type DataTableSortDirection = "asc" | "desc";
export type DataTableSortValue = string | number | null | undefined;

export interface DataTableColumn<Row> {
  key: string;
  label: string;
  initialWidth: number;
  minWidth?: number;
  resizable?: boolean;
  sortable?: boolean;
  sortValue?: (row: Row) => DataTableSortValue;
  compare?: (first: Row, second: Row) => number;
  render: (row: Row) => ReactNode;
  cellClassName?: string;
  headerAlign?: "left" | "center" | "right";
  headerClassName?: string;
}

interface DataTableSelection<Row> {
  allSelected: boolean;
  onToggleAll: () => void;
  isSelected: (row: Row) => boolean;
  onToggleRow: (row: Row) => void;
  rowLabel: (row: Row) => string;
  isSelectable?: (row: Row) => boolean;
  disabledReason?: (row: Row) => string | undefined;
}

interface DataTableProps<Row> {
  rows: Row[];
  columns: DataTableColumn<Row>[];
  getRowId: (row: Row) => string | number;
  selection?: DataTableSelection<Row>;
  emptyMessage?: string;
  pageSize?: number;
  currentPage?: number;
  rowHeight?: number;
  defaultSort?: {
    key: string;
    direction: DataTableSortDirection;
  };
  testId?: string;
}

const COLLATOR = new Intl.Collator("ko", {
  numeric: true,
  sensitivity: "base",
});

function compareValues(first: DataTableSortValue, second: DataTableSortValue) {
  const firstEmpty = first === null || first === undefined || first === "";
  const secondEmpty = second === null || second === undefined || second === "";
  if (firstEmpty !== secondEmpty) return firstEmpty ? 1 : -1;
  if (firstEmpty && secondEmpty) return 0;
  if (typeof first === "number" && typeof second === "number") {
    return first - second;
  }
  return COLLATOR.compare(String(first), String(second));
}

export function DataTable<Row>({
  rows,
  columns,
  getRowId,
  selection,
  emptyMessage = "조건에 맞는 항목이 없습니다.",
  pageSize,
  currentPage = 1,
  rowHeight = 49,
  defaultSort,
  testId,
}: DataTableProps<Row>) {
  const [sort, setSort] = useState(defaultSort);
  const [widths, setWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      columns.map((column) => [column.key, column.initialWidth]),
    ),
  );

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((item) => item.key === sort.key);
    if (!column?.sortable) return rows;
    return [...rows].sort((first, second) => {
      const result = column.compare
        ? column.compare(first, second)
        : compareValues(column.sortValue?.(first), column.sortValue?.(second));
      return sort.direction === "asc" ? result : -result;
    });
  }, [columns, rows, sort]);
  const displayedRows = pageSize
    ? sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedRows;

  const updateWidth = (column: DataTableColumn<Row>, width: number) => {
    setWidths((current) => ({
      ...current,
      [column.key]: Math.max(column.minWidth ?? 64, Math.round(width)),
    }));
  };

  const startResize = (
    event: ReactPointerEvent<HTMLSpanElement>,
    column: DataTableColumn<Row>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = widths[column.key] ?? column.initialWidth;
    const move = (moveEvent: PointerEvent) =>
      updateWidth(column, startWidth + moveEvent.clientX - startX);
    const stop = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", stop);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", stop);
  };

  const resizeWithKeyboard = (
    event: ReactKeyboardEvent<HTMLSpanElement>,
    column: DataTableColumn<Row>,
  ) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const step = event.shiftKey ? 30 : 10;
    updateWidth(
      column,
      (widths[column.key] ?? column.initialWidth) +
        (event.key === "ArrowRight" ? step : -step),
    );
  };

  const toggleSort = (column: DataTableColumn<Row>) => {
    if (!column.sortable) return;
    setSort((current) =>
      current?.key === column.key
        ? {
            key: column.key,
            direction: current.direction === "asc" ? "desc" : "asc",
          }
        : { key: column.key, direction: "asc" },
    );
  };

  const tableWidth =
    (selection ? 40 : 0) +
    columns.reduce(
      (total, column) => total + (widths[column.key] ?? column.initialWidth),
      0,
    );
  const selectableRows = selection?.isSelectable
    ? rows.filter(selection.isSelectable)
    : rows;

  return (
    <div className="overflow-hidden rounded-t-xl">
      <div className="overflow-x-auto">
        <table
          data-testid={testId}
          className="table-fixed border-collapse text-[12.5px]"
          style={{ width: "100%", minWidth: tableWidth }}
        >
          <colgroup>
            {selection && <col style={{ width: 40 }} />}
            {columns.map((column) => (
              <col
                key={column.key}
                data-column-key={column.key}
                style={{ width: widths[column.key] ?? column.initialWidth }}
              />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-surface-subtle border-border border-b">
              {selection && (
                <th className="w-10 px-3 py-2.5 text-left">
                  <Checkbox
                    aria-label="전체 선택"
                    checked={selection.allSelected}
                    disabled={selectableRows.length === 0}
                    onChange={selection.onToggleAll}
                  />
                </th>
              )}
              {columns.map((column) => {
                const active = sort?.key === column.key;
                const headerAlignClass =
                  column.headerAlign === "center"
                    ? "text-center"
                    : column.headerAlign === "right"
                      ? "text-right"
                      : "text-left";
                const headerContentAlignClass =
                  column.headerAlign === "center"
                    ? "justify-center text-center"
                    : column.headerAlign === "right"
                      ? "justify-end text-right"
                      : "justify-start text-left";
                return (
                  <th
                    key={column.key}
                    aria-sort={
                      column.sortable
                        ? active
                          ? sort.direction === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                        : undefined
                    }
                    className={[
                      "text-muted-foreground relative px-2.5 py-2.5 font-semibold whitespace-nowrap",
                      headerAlignClass,
                      column.headerClassName,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        aria-label={`${column.label} 정렬`}
                        onClick={() => toggleSort(column)}
                        className={[
                          "hover:text-foreground flex w-full items-center gap-1.5",
                          headerContentAlignClass,
                        ].join(" ")}
                      >
                        <span className="truncate">{column.label}</span>
                        {active ? (
                          sort.direction === "asc" ? (
                            <ChevronUpIcon className="size-3 shrink-0" />
                          ) : (
                            <ChevronDownIcon className="size-3 shrink-0" />
                          )
                        ) : (
                          <ChevronsUpDownIcon className="size-3 shrink-0 opacity-40" />
                        )}
                      </button>
                    ) : (
                      <span className="block truncate">{column.label}</span>
                    )}
                    {column.resizable !== false && (
                      <span
                        role="separator"
                        tabIndex={0}
                        aria-label={`${column.label} 열 너비 조절`}
                        aria-orientation="vertical"
                        aria-valuemin={column.minWidth ?? 64}
                        aria-valuenow={
                          widths[column.key] ?? column.initialWidth
                        }
                        onPointerDown={(event) => startResize(event, column)}
                        onKeyDown={(event) => resizeWithKeyboard(event, column)}
                        onDoubleClick={() =>
                          updateWidth(column, column.initialWidth)
                        }
                        className="hover:bg-primary/15 focus-visible:bg-primary/15 absolute top-0 right-0 z-10 h-full w-2 cursor-col-resize touch-none outline-none"
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 && (
              <tr className="border-border border-b">
                <td
                  colSpan={columns.length + (selection ? 1 : 0)}
                  style={{ height: rowHeight }}
                  className="text-muted-foreground text-center text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
            {displayedRows.map((row) => {
              const selected = selection?.isSelected(row) ?? false;
              const selectable = selection?.isSelectable?.(row) ?? true;
              return (
                <tr
                  key={getRowId(row)}
                  className={[
                    "border-border border-b",
                    selected ? "bg-primary-muted" : "",
                  ].join(" ")}
                >
                  {selection && (
                    <td className="px-3 py-2.5">
                      <Checkbox
                        aria-label={`${selection.rowLabel(row)} 선택`}
                        checked={selected}
                        disabled={!selectable}
                        title={selection.disabledReason?.(row)}
                        onChange={() => selection.onToggleRow(row)}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={
                        column.cellClassName ??
                        "text-foreground px-2.5 py-2.5 whitespace-nowrap"
                      }
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
