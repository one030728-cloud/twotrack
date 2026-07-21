"use client";

import { useId, useState } from "react";
import { XIcon } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MASTER_REQUIRED_TEAM,
  POSITION_OPTIONS,
  TEAM_OPTIONS,
  isMaster,
  roleLabel,
  type AuthUser,
  type PositionCode,
  type UserRole,
} from "@/features/auth/permissions";
import { useAuth } from "@/features/auth/auth-provider";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = (
  ["admin", "cs", "tech", "viewer"] as UserRole[]
).map((role) => ({ value: role, label: roleLabel(role) }));

export interface EmployeeFormValue {
  name: string;
  team: string;
  role: UserRole;
  positions: PositionCode[];
  active: boolean;
  username?: string;
  password?: string;
}

interface EmployeeFormModalProps {
  title: string;
  submitLabel: string;
  initial?: AuthUser;
  /** 이미 사용 중인 아이디 목록(수정 대상 본인 제외). 중복 검사에 사용. */
  existingUsernames?: string[];
  onClose: () => void;
  onSubmit: (value: EmployeeFormValue) => void;
}

export function EmployeeFormModal({
  title,
  submitLabel,
  initial,
  existingUsernames = [],
  onClose,
  onSubmit,
}: EmployeeFormModalProps) {
  const titleId = useId();
  const { user: currentUser } = useAuth();
  const canEditCredentials = !!currentUser && isMaster(currentUser);
  const [name, setName] = useState(initial?.name ?? "");
  const [team, setTeam] = useState(initial?.team ?? "");
  const [role, setRole] = useState<UserRole>(initial?.role ?? "cs");
  const [positions, setPositions] = useState<PositionCode[]>(
    initial?.positions ?? [],
  );
  const [active, setActive] = useState(initial?.active ?? true);
  const [username, setUsername] = useState(initial?.username ?? "");
  const [password, setPassword] = useState("");

  const isMasterRequiredTeam = team === MASTER_REQUIRED_TEAM;
  const trimmedUsername = username.trim();
  const usernameTaken =
    canEditCredentials &&
    trimmedUsername.length > 0 &&
    existingUsernames.includes(trimmedUsername);
  /** 아이디만 있고 비밀번호가 없으면 로그인이 불가능한 계정이 만들어지므로 함께 입력을 강제한다. */
  const passwordRequired =
    canEditCredentials &&
    trimmedUsername.length > 0 &&
    (!initial || !initial.username) &&
    !password;

  const teamOptions: { value: string; label: string }[] = TEAM_OPTIONS.map(
    (value) => ({ value, label: value }),
  );
  if (
    initial?.team &&
    !(TEAM_OPTIONS as readonly string[]).includes(initial.team)
  ) {
    teamOptions.unshift({ value: initial.team, label: initial.team });
  }

  const handleTeamChange = (value: string) => {
    setTeam(value);
    if (value === MASTER_REQUIRED_TEAM) {
      setPositions((prev) =>
        prev.includes("master") ? prev : [...prev, "master"],
      );
    }
  };

  const togglePosition = (position: PositionCode) => {
    if (isMasterRequiredTeam && position === "master") return;
    setPositions((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position],
    );
  };

  const canSubmit =
    !!name.trim() && !!team.trim() && !usernameTaken && !passwordRequired;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      team: team.trim(),
      role,
      positions,
      active,
      ...(canEditCredentials ? { username: trimmedUsername } : {}),
      ...(canEditCredentials && password ? { password } : {}),
    });
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
        {canEditCredentials && (
          <>
            <Input
              label="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={usernameTaken ? "이미 사용 중인 아이디입니다." : undefined}
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder={initial ? "변경 시에만 입력" : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={
                passwordRequired
                  ? "아이디를 입력하면 비밀번호도 함께 입력해야 합니다."
                  : undefined
              }
            />
          </>
        )}
        <Select
          label="팀"
          value={team || null}
          onValueChange={handleTeamChange}
          options={teamOptions}
          placeholder="팀 선택"
          disablePortal
        />
        <Select
          label="역할"
          value={role}
          onValueChange={(value) => setRole(value as UserRole)}
          options={ROLE_OPTIONS}
          disablePortal
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
                disabled={isMasterRequiredTeam && option.value === "master"}
                onChange={() => togglePosition(option.value)}
              />
            ))}
          </div>
          {isMasterRequiredTeam && (
            <span className="text-muted-foreground text-xs">
              개발팀은 마스터 직책이 자동으로 부여됩니다.
            </span>
          )}
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
