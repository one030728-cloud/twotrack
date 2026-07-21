export interface ChatChannel {
  id: string;
  name: string;
  description: string;
}

/** 팀 구조에 대응하는 고정 채널 목록. 채널 생성 기능이 생기기 전까지의 seam. */
export const CHAT_CHANNELS: ChatChannel[] = [
  { id: "all", name: "전체", description: "전 직원이 참여하는 공지 채널" },
  { id: "cs", name: "CS팀", description: "가맹 접수, 변경 관리 관련 논의" },
  { id: "tech", name: "기술지원팀", description: "설치·AS 현장 소통" },
  { id: "ops", name: "운영관리", description: "운영/관리 공지" },
];

export interface ChatMessage {
  id: string;
  channelId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface CreateChatMessageInput {
  channelId: string;
  content: string;
}
