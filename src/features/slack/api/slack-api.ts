import type {
  CreateSlackMessageInput,
  SlackMessageRecord,
} from "@/features/slack/types";

export async function fetchSlackMessages(): Promise<SlackMessageRecord[]> {
  const res = await fetch("/api/slack-messages");
  return res.json();
}

export async function sendSlackMessage(
  input: CreateSlackMessageInput & { actorId: string },
): Promise<SlackMessageRecord> {
  const res = await fetch("/api/slack-messages", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.json();
}
