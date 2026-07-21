export type UserRole = "admin" | "cs" | "tech" | "viewer";

export interface AuthUser {
  id: string;
  name: string;
  team: string;
  role: UserRole;
}

export const MOCK_USERS: AuthUser[] = [
  { id: "admin", name: "관리자", team: "운영관리", role: "admin" },
  { id: "cs", name: "서지은 팀장", team: "CS팀", role: "cs" },
  { id: "tech", name: "박기사", team: "기술지원팀", role: "tech" },
  { id: "viewer", name: "조회 전용", team: "감사", role: "viewer" },
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
