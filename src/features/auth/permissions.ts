export type UserRole = "admin" | "cs" | "tech" | "viewer";

/** 승인 워크플로우 전용 직책. 계정 역할(UserRole)과 분리된 별도 임명 개념. */
export type PositionCode = "manager" | "responsible_manager" | "team_lead";

export interface AuthUser {
  id: string;
  name: string;
  team: string;
  role: UserRole;
  positions: PositionCode[];
}

export const MOCK_USERS: AuthUser[] = [
  {
    id: "admin",
    name: "관리자",
    team: "운영관리",
    role: "admin",
    positions: [],
  },
  {
    id: "cs-manager",
    name: "정지은 매니저",
    team: "CS팀",
    role: "cs",
    positions: ["manager"],
  },
  {
    id: "cs-responsible",
    name: "서지은 책임매니저",
    team: "CS팀",
    role: "cs",
    positions: ["responsible_manager"],
  },
  {
    id: "cs-lead",
    name: "한소라 팀장",
    team: "CS팀",
    role: "cs",
    positions: ["team_lead"],
  },
  {
    id: "tech-manager",
    name: "박기사 매니저",
    team: "기술지원팀",
    role: "tech",
    positions: ["manager"],
  },
  {
    id: "tech-responsible",
    name: "이기사 책임매니저",
    team: "기술지원팀",
    role: "tech",
    positions: ["responsible_manager"],
  },
  {
    id: "tech-lead",
    name: "최기사 팀장",
    team: "기술지원팀",
    role: "tech",
    positions: ["team_lead"],
  },
  {
    id: "viewer",
    name: "조회 전용",
    team: "감사",
    role: "viewer",
    positions: [],
  },
];

const CS_PATHS = ["/franchise-receipts", "/changes", "/woo", "/internet"];
const TECH_PATHS = ["/installs", "/stores"];

function matchesAny(pathname: string, paths: string[]) {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function canAccessPath(role: UserRole, pathname: string): boolean {
  if (pathname === "/login") return true;
  if (pathname === "/") return true;
  if (role === "admin") return true;
  if (role === "viewer") {
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
  switch (position) {
    case "manager":
      return "매니저";
    case "responsible_manager":
      return "책임매니저";
    case "team_lead":
      return "팀장";
  }
}
