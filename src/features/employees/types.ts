import type {
  AuthUser,
  PositionCode,
  UserRole,
} from "@/features/auth/permissions";

export type { AuthUser };

/** mock 저장소 전용 레코드. password는 GET 응답 등 클라이언트에 내려가지 않는다. */
export interface EmployeeRecord extends AuthUser {
  password: string;
}

export interface CreateEmployeeInput {
  name: string;
  team: string;
  role: UserRole;
  positions?: PositionCode[];
  active?: boolean;
  /** 마스터 직책 보유자만 입력 가능. 비워두면 로그인 계정이 생성되지 않는다. */
  username?: string;
  password?: string;
}

export type UpdateEmployeeInput = Partial<
  Pick<AuthUser, "name" | "team" | "role" | "positions" | "active" | "username">
> & {
  /** 비워두면(undefined) 기존 비밀번호를 유지한다. */
  password?: string;
};
