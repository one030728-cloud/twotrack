import type { ChatMessage } from "@/features/chat/types";

/** 실제 서비스 초기 상태. 데모용 목데이터 없이 빈 목록에서 시작한다. */
export function createInitialChatMessages(): ChatMessage[] {
  return [];
}

/** 테스트 전용 목업 픽스처. 실제 앱 초기 데이터로는 사용하지 않는다. */
export function createFixtureChatMessages(): ChatMessage[] {
  return [
    {
      id: "chat-1",
      channelId: "all",
      authorId: "admin",
      authorName: "관리자",
      content: "이번 주 금요일 전사 회의는 오후 4시입니다.",
      createdAt: "2026-07-20T09:00:00+09:00",
    },
    {
      id: "chat-2",
      channelId: "cs",
      authorId: "cs-manager",
      authorName: "정지은 매니저",
      content: "카페 아모르 서류 재제출 안내 드렸습니다.",
      createdAt: "2026-07-21T09:10:00+09:00",
    },
    {
      id: "chat-3",
      channelId: "tech",
      authorId: "tech-manager",
      authorName: "박기사 매니저",
      content: "명동떡볶이 본점 설치 완료했습니다.",
      createdAt: "2026-07-21T10:05:00+09:00",
    },
  ];
}
