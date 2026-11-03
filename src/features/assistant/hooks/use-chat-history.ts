import { useMemo } from "react";
import { useAssistantChatStore } from "../store/chat-store";
import type { IslandChatRecord } from "../types";

// Recent chats, newest first. Mirrors the platform island's use-chat-history.
export function useChatHistory(limit = 20): IslandChatRecord[] {
    const chats = useAssistantChatStore((s) => s.chats);
    return useMemo(
        () =>
            Object.values(chats)
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .slice(0, limit),
        [chats, limit]
    );
}
