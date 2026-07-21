export type UserRole = "admin" | "cs" | "tech" | "viewer";

/**
 * 승인 워크플로우 전용 직책. 계정 역할(UserRole)과 분리된 별도 임명 개념.
 * cs_manager/cs_responsible, tech_manager/tech_responsible는 팀별로 분리된 직책이고,
 * team_lead는 CS/기술지원 두 도메인을 모두 최종수락하는 공통 직책이다.
 * master는 직원 관리 접근 + 전 단계 승인을 대행할 수 있는 최상위 직책이다.
 */
export type PositionCode =
  | "cs_manager"
  | "cs_responsible"
  | "tech_manager"
  | "tech_responsible"
  | "team_lead"
  | "master";

/** 직원 등록 시 선택 가능한 팀 목록. 개발팀은 마스터 직책 보유가 전제된다. */
export const TEAM_OPTIONS = ["영업", "CS", "기술지원", "개발팀"] as const;
export type TeamOption = (typeof TEAM_OPTIONS)[number];
/** 개발팀 소속은 마스터 직책이 자동으로 부여된다. */
export const MASTER_REQUIRED_TEAM: TeamOption = "개발팀";

export const POSITION_OPTIONS: { value: PositionCode; label: string }[] = [
  { value: "cs_manager", label: "CS 매니저" },
  { value: "cs_responsible", label: "CS 책임매니저" },
  { value: "tech_manager", label: "기술지원 매니저" },
  { value: "tech_responsible", label: "기술지원 책임매니저" },
  { value: "team_lead", label: "팀장" },
  { value: "master", label: "마스터" },
];

export interface AuthUser {
  id: string;
  name: string;
  team: string;
  role: UserRole;
  positions: PositionCode[];
  /** 재직 여부. 비활성 계정은 로그인할 수 없다. */
  active: boolean;
  /** 로그인 아이디. 마스터 직책 보유자만 부여/변경할 수 있다. */
  username: string;
}

/** 마스터 직책 보유 여부. 로그인 계정(아이디·비밀번호) 생성 권한의 기준이 된다. */
export function isMaster(user: Pick<AuthUser, "positions">): boolean {
  return user.positions.includes("master");
}

/** master 직책만 접근 가능한 경로. 일반 admin 역할이라도 master 직책이 없으면 접근할 수 없다. */
const MASTER_ONLY_PATHS = ["/activity-log"];
/** admin 역할 또는 master 직책만 접근 가능한 경로. */
const ADMIN_ONLY_PATHS = ["/admin/users"];

function matchesAny(pathname: string, paths: string[]) {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function canAccessPath(
  role: UserRole,
  pathname: string,
  positions: PositionCode[] = [],
): boolean {
  if (pathname === "/login") return true;
  if (pathname === "/") return true;
  if (matchesAny(pathname, MASTER_ONLY_PATHS)) {
    return positions.includes("master");
  }
  if (matchesAny(pathname, ADMIN_ONLY_PATHS)) {
    return role === "admin" || positions.includes("master");
  }
  // 팀 구분 없이 로그인한 모든 사용자가 나머지 탭에 접근할 수 있다.
  return true;
}

export function roleLabel(role: UserRole) {
  switch (role) {
    case "admin":
      return "관리자";
    case "cs":
      return "CS";
    case "tech":
      return "기술지원";
    case "viewer":
      return "조회";
  }
}

export function positionLabel(position: PositionCode) {
  return POSITION_OPTIONS.find((option) => option.value === position)!.label;
}
