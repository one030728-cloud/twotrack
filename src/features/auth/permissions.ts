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
  /** 재직 여부. 비활성 계정은 로그인 목록에서 제외된다. */
  active: boolean;
}

const CS_PATHS = ["/franchise-receipts", "/changes", "/woo", "/internet"];
const TECH_PATHS = ["/installs", "/stores"];

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
  if (role === "admin") return true;
  if (positions.includes("master")) return true;
  const crossTeam = positions.includes("team_lead");
  if (role === "viewer" || crossTeam) {
    return matchesAny(pathname, [...CS_PATHS, ...TECH_PATHS]);
  }
  if (role === "cs") return matchesAny(pathname, CS_PATHS);
  if (role === "tech") return matchesAny(pathname, TECH_PATHS);
  return false;
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
