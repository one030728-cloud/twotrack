"use client";

import { useState } from "react";
import { PlusIcon, ShieldCheckIcon, ShieldOffIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/ui/page-shell";
import {
  positionLabel,
  roleLabel,
  type AuthUser,
} from "@/features/auth/permissions";
import { useEmployees } from "@/features/employees/hooks/use-employees";
import {
  EmployeeFormModal,
  type EmployeeFormValue,
} from "@/features/employees/components/employee-form-modal";

export function UsersAdminPage() {
  const { loading, employees, addEmployee, editEmployee, removeEmployee } =
    useEmployees();
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AuthUser | null>(null);

  const holdsTopPosition = (employee: AuthUser) =>
    employee.role === "admin" || employee.positions.includes("master");
  const remainingTopHolders = employees.filter(holdsTopPosition).length;

  const handleAdd = async (value: EmployeeFormValue) => {
    await addEmployee(value);
    setAddOpen(false);
  };

  const handleEdit = async (value: EmployeeFormValue) => {
    if (!editTarget) return;
    await editEmployee(editTarget.id, value);
    setEditTarget(null);
  };

  const handleDelete = (employee: AuthUser) => {
    if (holdsTopPosition(employee) && remainingTopHolders <= 1) {
      window.alert("최소 한 명의 관리자 또는 마스터 계정은 유지해야 합니다.");
      return;
    }
    if (!window.confirm(`${employee.name} 계정을 삭제하시겠습니까?`)) return;
    removeEmployee(employee.id);
  };

  return (
    <PageShell className="gap-4">
      <PageHeader
        title="직원 관리"
        description="직원 계정과 역할·직책 권한을 관리합니다."
        actions={
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <PlusIcon className="size-3.5" />
            직원 추가
          </Button>
        }
      />
      <div className="border-border bg-card overflow-hidden rounded-lg border">
        <div className="border-border bg-surface-subtle text-muted-foreground grid grid-cols-[1fr_120px_1fr_100px_140px] border-b px-4 py-2.5 text-xs font-semibold">
          <span>직원</span>
          <span>역할</span>
          <span>직책</span>
          <span>상태</span>
          <span>관리</span>
        </div>
        {loading ? (
          <div className="text-muted-foreground px-4 py-8 text-center text-sm">
            불러오는 중입니다.
          </div>
        ) : (
          employees.map((employee) => (
            <div
              key={employee.id}
              className="border-border grid grid-cols-[1fr_120px_1fr_100px_140px] items-center border-b px-4 py-3 last:border-b-0"
            >
              <div>
                <div className="text-foreground text-sm font-bold">
                  {employee.name}
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {employee.team}
                  {employee.username ? ` · ${employee.username}` : ""}
                </div>
              </div>
              <Badge>{roleLabel(employee.role)}</Badge>
              <div className="flex flex-wrap gap-1.5">
                {employee.positions.length === 0 ? (
                  <span className="text-muted-foreground text-xs">-</span>
                ) : (
                  employee.positions.map((position) => (
                    <Badge key={position} tone="primary" size="sm">
                      {positionLabel(position)}
                    </Badge>
                  ))
                )}
              </div>
              <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                {employee.active ? (
                  <>
                    <ShieldCheckIcon className="text-primary size-4" />
                    활성
                  </>
                ) : (
                  <>
                    <ShieldOffIcon className="size-4" />
                    비활성
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setEditTarget(employee)}
                >
                  권한 변경
                </Button>
                <Button variant="danger" onClick={() => handleDelete(employee)}>
                  삭제
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {addOpen && (
        <EmployeeFormModal
          title="직원 추가"
          submitLabel="추가"
          existingUsernames={employees
            .map((e) => e.username)
            .filter((u): u is string => !!u)}
          onClose={() => setAddOpen(false)}
          onSubmit={handleAdd}
        />
      )}

      {editTarget && (
        <EmployeeFormModal
          title={`${editTarget.name} 권한 변경`}
          submitLabel="저장"
          initial={editTarget}
          existingUsernames={employees
            .filter((e) => e.id !== editTarget.id)
            .map((e) => e.username)
            .filter((u): u is string => !!u)}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEdit}
        />
      )}
    </PageShell>
  );
}
