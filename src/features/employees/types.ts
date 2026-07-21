import type {
  AuthUser,
  PositionCode,
  UserRole,
} from "@/features/auth/permissions";

export type { AuthUser };

export interface CreateEmployeeInput {
  name: string;
  team: string;
  role: UserRole;
  positions?: PositionCode[];
  active?: boolean;
}

export type UpdateEmployeeInput = Partial<
  Pick<AuthUser, "name" | "team" | "role" | "positions" | "active">
>;
