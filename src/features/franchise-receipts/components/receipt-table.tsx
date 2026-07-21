"use client";

import { MessageSquareTextIcon } from "lucide-react";
import { CopyableText } from "@/components/ui/copyable-text";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { InlineDatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { StageProgress } from "@/features/franchise-receipts/components/stage-progress";
import { STATUS_COLORS } from "@/features/franchise-receipts/status-colors";
import {
  BIZ_TYPES,
  CS_REP_OPTIONS,
  RECEIPT_CHANNELS,
  RECEIPT_STATUS_OPTIONS,
  UNASSIGNED_LABEL,
  UNSET_LABEL,
  type FranchiseReceipt,
  type ReceiptStatus,
} from "@/features/franchise-receipts/types";

interface ReceiptTableProps {
  receipts: FranchiseReceipt[];
  selected: Record<number, true>;
  allSelected: boolean;
  onToggleRow: (id: number) => void;
  onToggleSelectAll: () => void;
  onUpdateField: (id: number, patch: Partial<FranchiseReceipt>) => void;
  onOpenDetail: (id: number) => void;
  onOpenMemo: (id: number) => void;
  pageSize: number;
  currentPage?: number;
}

const CHANNEL_OPTIONS = RECEIPT_CHANNELS.map((value) => ({
  value,
  label: value,
}));
const BIZ_TYPE_OPTIONS = BIZ_TYPES.map((value) => ({
  value,
  label: value,
}));

export function ReceiptTable({
  receipts,
  selected,
  allSelected,
  onToggleRow,
  onToggleSelectAll,
  onUpdateField,
  onOpenDetail,
  onOpenMemo,
  pageSize,
  currentPage = 1,
}: ReceiptTableProps) {
  const columns: DataTableColumn<FranchiseReceipt>[] = [
    {
      key: "receiptDate",
      label: "접수일",
      initialWidth: 120,
      minWidth: 104,
      sortable: true,
      sortValue: (row) => row.receiptDate,
      cellClassName: "text-foreground px-2.5 py-2.5 whitespace-nowrap",
      render: (row) => (
        <InlineDatePicker
          value={row.receiptDate}
          ariaLabel={`${row.name} 접수일 변경`}
          dialogAriaLabel={`${row.name} 접수일`}
          onChange={(value) => onUpdateField(row.id, { receiptDate: value })}
        />
      ),
    },
    {
      key: "channel",
      label: "접수 채널",
      initialWidth: 135,
      minWidth: 120,
      sortable: true,
      sortValue: (row) => row.channel ?? UNSET_LABEL,
      cellClassName: "text-foreground px-2.5 py-2.5 whitespace-nowrap",
      render: (row) => (
        <Select
          label={`${row.name} 접수 채널`}
          hideLabel
          value={row.channel}
          onValueChange={(value) =>
            onUpdateField(row.id, {
              channel: value as FranchiseReceipt["channel"],
            })
          }
          options={CHANNEL_OPTIONS}
          placeholder={UNSET_LABEL}
          className="h-auto w-full min-w-0 border-none bg-transparent py-0 pr-6 pl-0 text-[12.5px]"
        />
      ),
    },
    {
      key: "bizType",
      label: "사업자 유형",
      initialWidth: 155,
      minWidth: 140,
      sortable: true,
      sortValue: (row) => row.bizType ?? UNSET_LABEL,
      cellClassName: "text-foreground px-2.5 py-2.5 whitespace-nowrap",
      render: (row) => (
        <Select
          label={`${row.name} 사업자 유형`}
          hideLabel
          value={row.bizType}
          onValueChange={(value) =>
            onUpdateField(row.id, {
              bizType: value as FranchiseReceipt["bizType"],
            })
          }
          options={BIZ_TYPE_OPTIONS}
          placeholder={UNSET_LABEL}
          className="h-auto w-full min-w-0 border-none bg-transparent py-0 pr-6 pl-0 text-[12.5px]"
        />
      ),
    },
    {
      key: "name",
      label: "상호명",
      initialWidth: 170,
      minWidth: 125,
      sortable: true,
      sortValue: (row) => row.name,
      cellClassName: "max-w-[170px] px-2.5 py-2.5 font-semibold",
      render: (row) => (
        <button
          type="button"
          onClick={() => onOpenDetail(row.id)}
          className="text-foreground hover:text-primary block w-full truncate text-left"
        >
          {row.name}
        </button>
      ),
    },
    {
      key: "owner",
      label: "대표자",
      initialWidth: 100,
      minWidth: 80,
      sortable: true,
      sortValue: (row) => row.owner,
      render: (row) => row.owner,
    },
    {
      key: "phone",
      label: "연락처",
      initialWidth: 140,
      minWidth: 120,
      sortable: true,
      sortValue: (row) => row.phone,
      render: (row) => <CopyableText value={row.phone} label="연락처" />,
    },
    {
      key: "salesRep",
      label: "등록자",
      initialWidth: 100,
      minWidth: 80,
      sortable: true,
      sortValue: (row) => row.salesRep,
      render: (row) => (
        <span className="text-muted-foreground">{row.salesRep}</span>
      ),
    },
    {
      key: "csRep",
      label: "담당자",
      initialWidth: 110,
      minWidth: 90,
      sortable: true,
      sortValue: (row) => row.csRep ?? UNASSIGNED_LABEL,
      cellClassName: "text-foreground px-2.5 py-2.5 whitespace-nowrap",
      render: (row) => (
        <Select
          label={`${row.name} 담당자`}
          hideLabel
          value={row.csRep}
          onValueChange={(value) =>
            onUpdateField(row.id, {
              csRep: value,
            })
          }
          options={CS_REP_OPTIONS}
          placeholder={UNASSIGNED_LABEL}
          className="h-auto w-full min-w-0 border-none bg-transparent py-0 pr-6 pl-0 text-[12.5px]"
        />
      ),
    },
    {
      key: "internet",
      label: "인터넷",
      initialWidth: 90,
      minWidth: 74,
      sortable: true,
      sortValue: (row) => row.internet ?? UNSET_LABEL,
      render: (row) => (
        <span
          className={!row.internet ? "text-muted-foreground" : "text-green-500"}
        >
          {row.internet ?? UNSET_LABEL}
        </span>
      ),
    },
    {
      key: "status",
      label: "상태",
      initialWidth: 150,
      minWidth: 120,
      cellClassName: "text-foreground px-2.5 py-2.5 whitespace-nowrap",
      render: (row) => (
        <Select
          label={`${row.name} 상태`}
          hideLabel
          value={row.status}
          onValueChange={(value) =>
            onUpdateField(row.id, { status: value as ReceiptStatus })
          }
          options={RECEIPT_STATUS_OPTIONS}
          className={[
            "h-auto w-full min-w-0 rounded-md border-none px-2.5 py-1.5 text-[11.5px] font-semibold",
            STATUS_COLORS[row.status].pill,
          ].join(" ")}
        />
      ),
    },
    {
      key: "stage",
      label: "진행률",
      initialWidth: 145,
      minWidth: 120,
      headerAlign: "center",
      render: (row) => <StageProgress stage={row.stage} status={row.status} />,
    },
    {
      key: "memo",
      label: "메모",
      initialWidth: 70,
      minWidth: 64,
      resizable: false,
      headerAlign: "center",
      render: (row) => (
        <button
          type="button"
          onClick={() => onOpenMemo(row.id)}
          aria-label={
            row.memo ? `${row.name} 메모: ${row.memo}` : `${row.name} 메모`
          }
          className="mx-auto block"
        >
          <MessageSquareTextIcon
            className={[
              "size-4",
              row.memoHistory.length > 0
                ? "text-muted-foreground"
                : "text-border",
            ].join(" ")}
          />
        </button>
      ),
    },
  ];

  return (
    <DataTable
      rows={receipts}
      columns={columns}
      getRowId={(row) => row.id}
      pageSize={pageSize}
      currentPage={currentPage}
      emptyMessage="조건에 맞는 접수 건이 없습니다."
      selection={{
        allSelected,
        onToggleAll: onToggleSelectAll,
        isSelected: (row) => !!selected[row.id],
        onToggleRow: (row) => onToggleRow(row.id),
        rowLabel: (row) => row.name,
      }}
    />
  );
}
