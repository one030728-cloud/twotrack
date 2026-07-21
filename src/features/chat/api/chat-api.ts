import type {
  ChatMessage,
  CreateChatMessageInput,
} from "@/features/chat/types";

export async function fetchChatMessages(): Promise<ChatMessage[]> {
  const res = await fetch("/api/chat-messages");
  return res.json();
}

export async function sendChatMessage(
  input: CreateChatMessageInput & { actorId: string },
): Promise<ChatMessage> {
  const res = await fetch("/api/chat-messages", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.json();
}
