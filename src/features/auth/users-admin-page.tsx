"use client";

import { ShieldCheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import { MOCK_USERS, roleLabel } from "@/features/auth/permissions";

export function UsersAdminPage() {
  return (
    <PageShell className="gap-4">
      <PageHeader
        title="직원 관리"
        description="역할별 접근 권한을 확인하는 mock 관리 화면입니다."
      />
      <div className="border-border bg-card overflow-hidden rounded-lg border">
        <div className="border-border bg-surface-subtle text-muted-foreground grid grid-cols-[1fr_140px_160px] border-b px-4 py-2.5 text-xs font-semibold">
          <span>직원</span>
          <span>역할</span>
          <span>상태</span>
        </div>
        {MOCK_USERS.map((user) => (
          <div
            key={user.id}
            className="border-border grid grid-cols-[1fr_140px_160px] items-center border-b px-4 py-3 last:border-b-0"
          >
            <div>
              <div className="text-foreground text-sm font-bold">
                {user.name}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">
                {user.team}
              </div>
            </div>
            <Badge>{roleLabel(user.role)}</Badge>
            <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <ShieldCheckIcon className="text-primary size-4" />
              활성
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
