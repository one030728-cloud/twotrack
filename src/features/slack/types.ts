/** Slack 채널 연동이 준비되기 전까지의 고정 채널 목록 (seam). */
export const SLACK_CHANNELS = [
  "#일반",
  "#가맹접수",
  "#기술지원",
  "#긴급",
] as const;

export type SlackChannel = (typeof SLACK_CHANNELS)[number];

export interface SlackMessageRecord {
  id: string;
  channel: SlackChannel;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
}

export interface CreateSlackMessageInput {
  channel: SlackChannel;
  content: string;
}
