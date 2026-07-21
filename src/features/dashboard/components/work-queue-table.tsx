import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  WORKFLOW_DOMAIN_LABELS,
  WORKFLOW_KIND_LABELS,
} from "@/features/activity-log/types";
import {
  getPendingDue,
  getRiskReasons,
  type RiskReason,
} from "@/features/dashboard/lib/work-queue";
import {
  WORKFLOW_STAGE_LABELS,
  type ApprovalWorkflow,
} from "@/features/workflow/types";

const RISK_LABELS: Record<RiskReason, string> = {
  info_required: "정보 미등록",
  overdue: "마감 초과",
  due_soon: "마감 임박",
};

interface WorkQueueTableProps {
  workflows: ApprovalWorkflow[];
  emptyMessage: string;
}

export function WorkQueueTable({
  workflows,
  emptyMessage,
}: WorkQueueTableProps) {
  const columns: DataTableColumn<ApprovalWorkflow>[] = [
    {
      key: "domain",
      label: "도메인",
      initialWidth: 90,
      render: (row) => (
        <Badge size="sm">{WORKFLOW_DOMAIN_LABELS[row.domain]}</Badge>
      ),
    },
    {
      key: "kind",
      label: "업무",
      initialWidth: 200,
      sortable: true,
      sortValue: (row) => `${WORKFLOW_KIND_LABELS[row.kind]} #${row.entityId}`,
      render: (row) => (
        <span>
          {WORKFLOW_KIND_LABELS[row.kind]} · #{row.entityId}
        </span>
      ),
    },
    {
      key: "stage",
      label: "단계",
      initialWidth: 140,
      render: (row) => (
        <Badge tone={row.stage === "rejected" ? "error" : "primary"} size="sm">
          {WORKFLOW_STAGE_LABELS[row.stage]}
        </Badge>
      ),
    },
    {
      key: "requestedBy",
      label: "요청자",
      initialWidth: 120,
      sortable: true,
      sortValue: (row) => row.requestedByName,
      render: (row) => row.requestedByName,
    },
    {
      key: "requestedAt",
      label: "요청일",
      initialWidth: 110,
      sortable: true,
      sortValue: (row) => row.requestedAt,
      render: (row) => row.requestedAt.slice(0, 10),
    },
    {
      key: "due",
      label: "마감/담당",
      initialWidth: 170,
      render: (row) => {
        const pending = getPendingDue(row);
        if (!pending) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <span>
            {pending.dueAt.slice(0, 10)}
            {pending.assigneeName ? ` · ${pending.assigneeName}` : ""}
          </span>
        );
      },
    },
    {
      key: "risk",
      label: "위험",
      initialWidth: 170,
      render: (row) => {
        const reasons = getRiskReasons(row);
        if (reasons.length === 0) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {reasons.map((reason) => (
              <Badge key={reason} tone="error" size="sm">
                {RISK_LABELS[reason]}
              </Badge>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      rows={workflows}
      columns={columns}
      getRowId={(row) => row.id}
      emptyMessage={emptyMessage}
      defaultSort={{ key: "requestedAt", direction: "desc" }}
    />
  );
}
