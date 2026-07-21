import type { SlackMessageRecord } from "@/features/slack/types";

/** 실제 서비스 초기 상태. 데모용 목데이터 없이 빈 목록에서 시작한다. */
export function createInitialSlackMessages(): SlackMessageRecord[] {
  return [];
}

/** 테스트 전용 목업 픽스처. 실제 앱 초기 데이터로는 사용하지 않는다. */
export function createFixtureSlackMessages(): SlackMessageRecord[] {
  return [
    {
      id: "slack-1",
      channel: "#일반",
      senderId: "admin",
      senderName: "관리자",
      content: "오늘 오전 시스템 점검이 있었습니다.",
      sentAt: "2026-07-20T08:30:00+09:00",
    },
    {
      id: "slack-2",
      channel: "#가맹접수",
      senderId: "cs-manager",
      senderName: "정지은 매니저",
      content: "신규 접수 3건 확인 부탁드립니다.",
      sentAt: "2026-07-21T09:15:00+09:00",
    },
    {
      id: "slack-3",
      channel: "#기술지원",
      senderId: "tech-manager",
      senderName: "박기사 매니저",
      content: "카페 아모르 설치 자재 준비 완료했습니다.",
      sentAt: "2026-07-21T10:00:00+09:00",
    },
  ];
}
