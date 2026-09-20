import type { AssistantConfig } from "@/lib/assistant";
import { ChatSurface } from "@/features/assistant/components/chat-surface";
import { AssistantErrorBoundary } from "@/features/assistant/components/error-boundary";
import { cn } from "@/lib/utils";

// Thin wrapper kept for backwards compat. New logic lives in ChatSurface.
// Wrapped in an error boundary so a render error degrades to an inline message
// instead of white-screening the whole dashboard (covers widget + page).
export function AssistantChat({
    config,
    className,
}: {
    config: AssistantConfig;
    className?: string;
}) {
    return (
        <AssistantErrorBoundary>
            <ChatSurface config={config} className={cn("h-full min-h-0", className)} />
        </AssistantErrorBoundary>
    );
}
