import type { AuthUser } from "@/features/auth/permissions";

/** 초기 직원 계정. 실제 조직도 성격의 데이터라 데모 고객 데이터와 달리 비우지 않는다. */
export function createInitialEmployees(): AuthUser[] {
  return [
    {
      id: "admin",
      name: "관리자",
      team: "운영관리",
      role: "admin",
      positions: [],
      active: true,
    },
    {
      id: "master",
      name: "김마스터",
      team: "운영관리",
      role: "viewer",
      positions: ["master"],
      active: true,
    },
    {
      id: "cs-manager",
      name: "정지은 매니저",
      team: "CS팀",
      role: "cs",
      positions: ["cs_manager"],
      active: true,
    },
    {
      id: "cs-responsible",
      name: "서지은 책임매니저",
      team: "CS팀",
      role: "cs",
      positions: ["cs_responsible"],
      active: true,
    },
    {
      id: "cs-lead",
      name: "한소라 팀장",
      team: "CS팀",
      role: "cs",
      positions: ["team_lead"],
      active: true,
    },
    {
      id: "tech-manager",
      name: "박기사 매니저",
      team: "기술지원팀",
      role: "tech",
      positions: ["tech_manager"],
      active: true,
    },
    {
      id: "tech-responsible",
      name: "이기사 책임매니저",
      team: "기술지원팀",
      role: "tech",
      positions: ["tech_responsible"],
      active: true,
    },
    {
      id: "tech-lead",
      name: "최기사 팀장",
      team: "기술지원팀",
      role: "tech",
      positions: ["team_lead"],
      active: true,
    },
    {
      id: "viewer",
      name: "조회 전용",
      team: "감사",
      role: "viewer",
      positions: [],
      active: true,
    },
  ];
}
