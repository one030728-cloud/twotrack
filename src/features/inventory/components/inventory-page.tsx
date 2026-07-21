"use client";

import { useMemo, useState } from "react";
import { ClipboardCheckIcon, PlusIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { useAuth } from "@/features/auth/auth-provider";
import { useInventory } from "@/features/inventory/hooks/use-inventory";
import {
  INVENTORY_AUDIT_STATUS_META,
  type InventoryAuditStatus,
  type InventoryItemRecord,
} from "@/features/inventory/types";
import {
  InventoryItemModal,
  type InventoryItemFormValue,
} from "@/features/inventory/components/inventory-item-modal";
import { InventoryCountModal } from "@/features/inventory/components/inventory-count-modal";

const STATUS_BADGE_TONE: Record<
  InventoryAuditStatus,
  "primary" | "neutral" | "error"
> = {
  pending: "neutral",
  matched: "primary",
  mismatched: "error",
};

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border bg-card rounded-lg border px-4 py-3">
      <div className="text-muted-foreground text-xs font-medium">{label}</div>
      <div className="text-foreground mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

export function InventoryPage() {
  const { user } = useAuth();
  const { loading, items, addItem, recordCount, removeItem } = useInventory();
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [countTarget, setCountTarget] = useState<InventoryItemRecord | null>(
    null,
  );

  const filteredItems = useMemo(() => {
    const normalized = query.trim();
    if (!normalized) return items;
    return items.filter((item) =>
      [item.modelName, item.location].join(" ").includes(normalized),
    );
  }, [items, query]);

  const handleAdd = async (value: InventoryItemFormValue) => {
    await addItem(value);
    setAddOpen(false);
  };

  const handleCount = async (input: {
    countedQty: number;
    countedBy: string;
  }) => {
    if (!countTarget) return;
    await recordCount(countTarget.id, input);
    setCountTarget(null);
  };

  const handleDelete = (item: InventoryItemRecord) => {
    if (
      !window.confirm(
        `${item.modelName} (${item.location}) 품목을 삭제하시겠습니까?`,
      )
    ) {
      return;
    }
    removeItem(item.id);
  };

  return (
    <PageShell className="gap-4">
      <PageHeader
        title="재고 실사"
        description="장부상 수량과 실제 실사 수량을 비교해 재고 불일치를 관리합니다."
        actions={
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <PlusIcon className="size-3.5" />
            품목 추가
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <StatTile label="전체 품목" value={items.length} />
        <StatTile
          label="실사대기"
          value={items.filter((i) => i.status === "pending").length}
        />
        <StatTile
          label="불일치"
          value={items.filter((i) => i.status === "mismatched").length}
        />
      </div>

      <Input
        label="품목 검색"
        hideLabel
        placeholder="품목명, 보관 위치 검색"
        className="max-w-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="border-border bg-card overflow-hidden rounded-lg border">
        <div className="border-border bg-surface-subtle text-muted-foreground grid grid-cols-[1fr_120px_100px_100px_120px_140px_140px] gap-2 border-b px-4 py-2.5 text-xs font-semibold">
          <span>품목</span>
          <span>보관 위치</span>
          <span>장부수량</span>
          <span>실사수량</span>
          <span>상태</span>
          <span>실사자</span>
          <span>관리</span>
        </div>
        {loading ? (
          <div className="text-muted-foreground px-4 py-8 text-center text-sm">
            불러오는 중입니다.
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-muted-foreground px-4 py-8 text-center text-sm">
            조건에 맞는 품목이 없습니다.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="border-border grid grid-cols-[1fr_120px_100px_100px_120px_140px_140px] items-center gap-2 border-b px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <div className="text-foreground truncate text-sm font-bold">
                  {item.modelName}
                </div>
                {item.memo && (
                  <div className="text-muted-foreground mt-0.5 truncate text-xs">
                    {item.memo}
                  </div>
                )}
              </div>
              <span className="text-muted-foreground truncate text-sm">
                {item.location}
              </span>
              <span className="text-foreground text-sm">
                {item.expectedQty}
              </span>
              <span className="text-foreground text-sm">
                {item.countedQty ?? "-"}
              </span>
              <Badge tone={STATUS_BADGE_TONE[item.status]}>
                {INVENTORY_AUDIT_STATUS_META[item.status].label}
              </Badge>
              <span className="text-muted-foreground truncate text-sm">
                {item.countedBy ?? "-"}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setCountTarget(item)}
                >
                  <ClipboardCheckIcon className="size-3.5" />
                  실사
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(item)}
                >
                  삭제
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {addOpen && (
        <InventoryItemModal
          onClose={() => setAddOpen(false)}
          onSubmit={handleAdd}
        />
      )}

      {countTarget && (
        <InventoryCountModal
          item={countTarget}
          defaultCountedBy={user?.name ?? ""}
          onClose={() => setCountTarget(null)}
          onSubmit={handleCount}
        />
      )}
    </PageShell>
  );
}
