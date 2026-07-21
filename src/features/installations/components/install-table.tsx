"use client";

import { StickyNoteIcon } from "lucide-react";
import { CopyableText } from "@/components/ui/copyable-text";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Select } from "@/components/ui/select";
import { INSTALL_STATUS_COLORS } from "@/features/installations/status-colors";
import {
  INSTALL_TECH_OPTIONS,
  statusOptionsForKind,
  type InstallKind,
  type InstallRecord,
  type InstallStatus,
} from "@/features/installations/types";

interface InstallTableProps {
  records: InstallRecord[];
  kind: InstallKind;
  selected: Record<number, true>;
  allSelected: boolean;
  onToggleRow: (id: number) => void;
  onToggleSelectAll: () => void;
  onUpdateField: (id: number, patch: Partial<InstallRecord>) => void;
  onOpenDetail: (id: number) => void;
  onOpenMemo: (id: number) => void;
  pageSize: number;
  currentPage?: number;
}

function middleHeaders(kind: InstallKind): [string, string] {
  switch (kind) {
    case "install":
      return ["주소", "설치예정일/시간대"];
    case "parcel":
      return ["배송지", "송장번호"];
    case "as":
      return ["방문주소", "증상·접수내용"];
  }
}

function fullAddress(record: InstallRecord) {
  return (
    [record.address, record.addressDetail].filter(Boolean).join(" ") || "-"
  );
}

function secondaryValue(record: InstallRecord, kind: InstallKind) {
  switch (kind) {
    case "install":
      return record.scheduledDate
        ? `${record.scheduledDate}${record.timeSlot ? ` · ${record.timeSlot}` : ""}`
        : "-";
    case "parcel":
      return record.trackingNo ?? "-";
    case "as":
      return record.symptom || "-";
  }
}

export function InstallTable({
  records,
  kind,
  selected,
  allSelected,
  onToggleRow,
  onToggleSelectAll,
  onUpdateField,
  onOpenDetail,
  onOpenMemo,
  pageSize,
  currentPage = 1,
}: InstallTableProps) {
  const [headerA, headerB] = middleHeaders(kind);
  const columns: DataTableColumn<InstallRecord>[] = [
    {
      key: "customerName",
      label: "고객명",
      initialWidth: 170,
      minWidth: 125,
      sortable: true,
      sortValue: (row) => row.customerName,
      cellClassName: "max-w-[170px] px-2.5 py-2.5 font-semibold",
      render: (row) => (
        <button
          type="button"
          onClick={() => onOpenDetail(row.id)}
          className="text-foreground hover:text-primary block w-full truncate text-left"
        >
          {row.customerName}
        </button>
      ),
    },
    {
      key: "phone",
      label: "전화번호",
      initialWidth: 140,
      minWidth: 120,
      sortable: true,
      sortValue: (row) => row.phone,
      render: (row) => <CopyableText value={row.phone} label="전화번호" />,
    },
    {
      key: "primaryDetail",
      label: headerA,
      initialWidth: 230,
      minWidth: 150,
      sortable: true,
      sortValue: fullAddress,
      cellClassName: "text-foreground truncate px-2.5 py-2.5",
      render: fullAddress,
    },
    {
      key: "secondaryDetail",
      label: headerB,
      initialWidth: 190,
      minWidth: 130,
      sortable: true,
      sortValue: (row) => secondaryValue(row, kind),
      cellClassName: "text-foreground truncate px-2.5 py-2.5",
      render: (row) => secondaryValue(row, kind),
    },
    {
      key: "product",
      label: "제품",
      initialWidth: 170,
      minWidth: 120,
      sortable: true,
      sortValue: (row) => row.product,
      cellClassName: "text-foreground truncate px-2.5 py-2.5",
      render: (row) => row.product || "-",
    },
    {
      key: "registeredBy",
      label: "등록자",
      initialWidth: 120,
      minWidth: 96,
      sortable: true,
      sortValue: (row) => row.registeredBy,
      render: (row) =>
        row.source === "franchise" ? (
          <span className="inline-flex rounded-full !bg-blue-500/15 px-2.5 py-1 text-[11px] font-semibold !text-blue-500">
            가맹접수 연동
          </span>
        ) : (
          <span className="text-muted-foreground">{row.registeredBy}</span>
        ),
    },
    {
      key: "status",
      label: "상태",
      initialWidth: 150,
      minWidth: 120,
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => (
        <Select
          label={`${row.customerName} 상태`}
          hideLabel
          value={row.status}
          onValueChange={(value) =>
            onUpdateField(row.id, { status: value as InstallStatus })
          }
          options={statusOptionsForKind(kind)}
          className={[
            "h-auto rounded-md border-none px-2.5 py-1.5 text-[11.5px] font-semibold",
            INSTALL_STATUS_COLORS[row.status].pill,
          ].join(" ")}
        />
      ),
    },
    {
      key: "assignedTech",
      label: "담당기사",
      initialWidth: 120,
      minWidth: 96,
      sortable: true,
      sortValue: (row) => row.assignedTech ?? "미배정",
      render: (row) => (
        <Select
          label={`${row.customerName} 담당기사`}
          hideLabel
          value={row.assignedTech ?? "미배정"}
          onValueChange={(value) =>
            onUpdateField(row.id, {
              assignedTech: value === "미배정" ? null : value,
            })
          }
          options={INSTALL_TECH_OPTIONS}
          className="h-auto border-none bg-transparent py-0 pr-6 pl-0 text-[12.5px]"
        />
      ),
    },
    {
      key: "memo",
      label: "메모",
      initialWidth: 70,
      minWidth: 64,
      resizable: false,
      sortable: true,
      sortValue: (row) => row.memo.length,
      render: (row) => (
        <button
          type="button"
          onClick={() => onOpenMemo(row.id)}
          aria-label={`${row.customerName} 메모`}
          className="mx-auto block"
        >
          <StickyNoteIcon
            className={[
              "size-4",
              row.memo ? "text-muted-foreground" : "text-border",
            ].join(" ")}
          />
        </button>
      ),
    },
  ];

  return (
    <DataTable
      rows={records}
      columns={columns}
      getRowId={(row) => row.id}
      pageSize={pageSize}
      currentPage={currentPage}
      emptyMessage="조건에 맞는 건이 없습니다."
      selection={{
        allSelected,
        onToggleAll: onToggleSelectAll,
        isSelected: (row) => !!selected[row.id],
        onToggleRow: (row) => onToggleRow(row.id),
        rowLabel: (row) => row.customerName,
      }}
    />
  );
}
