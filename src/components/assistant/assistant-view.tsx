import type { AssistantConfig } from "@/lib/assistant";
import { AssistantChat } from "./assistant-chat";
import { ChatHistorySidebar } from "@/features/assistant/components/chat-history";

// Full-page assistant: a centered, full-height chat for a sidebar "Assistant"
// tab. A persistent chat-history sidebar on the left lets the user navigate
// between past conversations and start a new one; the chat surface is the same
// one the floating widget uses.
export function AssistantView({ config }: { config: AssistantConfig }) {
  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      <ChatHistorySidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border/40 px-4 py-3 text-sm font-medium">
          {config.title || "Assistant"}
        </div>
        {/* Full-bleed page, but the conversation column stays a readable,
            centered width (messages + composer together) like the platform. */}
        <div className="mx-auto flex w-full max-w-[860px] min-h-0 flex-1 flex-col">
          <AssistantChat config={config} className="flex-1 min-h-0" />
        </div>
      </div>
    </div>
  );
}
