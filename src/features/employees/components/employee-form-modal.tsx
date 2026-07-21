"use client";

import { useId, useState } from "react";
import { XIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  POSITION_OPTIONS,
  roleLabel,
  type AuthUser,
  type PositionCode,
  type UserRole,
} from "@/features/auth/permissions";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = (
  ["admin", "cs", "tech", "viewer"] as UserRole[]
).map((role) => ({ value: role, label: roleLabel(role) }));

export interface EmployeeFormValue {
  name: string;
  team: string;
  role: UserRole;
  positions: PositionCode[];
  active: boolean;
}

interface EmployeeFormModalProps {
  title: string;
  submitLabel: string;
  initial?: AuthUser;
  onClose: () => void;
  onSubmit: (value: EmployeeFormValue) => void;
}

export function EmployeeFormModal({
  title,
  submitLabel,
  initial,
  onClose,
  onSubmit,
}: EmployeeFormModalProps) {
  const titleId = useId();
  const [name, setName] = useState(initial?.name ?? "");
  const [team, setTeam] = useState(initial?.team ?? "");
  const [role, setRole] = useState<UserRole>(initial?.role ?? "cs");
  const [positions, setPositions] = useState<PositionCode[]>(
    initial?.positions ?? [],
  );
  const [active, setActive] = useState(initial?.active ?? true);

  const togglePosition = (position: PositionCode) => {
    setPositions((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position],
    );
  };

  const canSubmit = name.trim() && team.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ name: name.trim(), team: team.trim(), role, positions, active });
  };

  return (
    <Dialog open onClose={onClose} labelledBy={titleId} className="w-[480px]">
      <div className="border-border flex items-center justify-between border-b px-6 py-5">
        <div id={titleId} className="text-foreground text-lg font-bold">
          {title}
        </div>
        <Button variant="ghost" size="icon" aria-label="닫기" onClick={onClose}>
          <XIcon className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-4 px-6 py-5">
        <Input
          label="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="팀"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
        />
        <Select
          label="역할"
          value={role}
          onValueChange={(value) => setRole(value as UserRole)}
          options={ROLE_OPTIONS}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs">
            직책 (중복 선택 가능)
          </span>
          <div className="flex flex-col gap-2">
            {POSITION_OPTIONS.map((option) => (
              <Checkbox
                key={option.value}
                label={option.label}
                checked={positions.includes(option.value)}
                onChange={() => togglePosition(option.value)}
              />
            ))}
          </div>
        </div>

        <Checkbox
          label="활성 (재직 중)"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
      </div>

      <div className="border-border flex justify-end gap-2 border-t px-6 py-4">
        <Button onClick={onClose}>취소</Button>
        <Button variant="primary" disabled={!canSubmit} onClick={handleSubmit}>
          {submitLabel}
        </Button>
      </div>
    </Dialog>
  );
}
