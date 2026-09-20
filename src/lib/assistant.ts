// Base-app layer: client for the embedded agent assistant (platform_app.py).
// The browser talks only to this app's backend, which proxies to the platform
// agent with the API key held server-side. No dashboard-specific code here.
import { apiUrl } from "./base";

export interface AssistantConfig {
  enabled: boolean;
  title: string;
  placement: "widget" | "page" | "both";
  greeting: string;
  starters: string[];
}

export async function fetchAssistantConfig(): Promise<AssistantConfig> {
  const res = await fetch(apiUrl("api/assistant"), { cache: "no-store" });
  if (!res.ok) throw new Error(`/api/assistant failed: ${res.status}`);
  return res.json();
}

// Normalized events emitted by the backend proxy (a small, stable subset of the
// platform's AG-UI stream).
export interface AssistantEvent {
  type: "text" | "reasoning" | "tool" | "run_started" | "run_finished" | "error";
  delta?: string;
  message?: string;
  status?: "running" | "done";
  name?: string;
  tool_call_id?: string;
  args_delta?: string;
  result?: unknown;
  thread_id?: string;
  run_id?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Stream one chat turn. `onEvent` fires per normalized event; resolves when the
// stream closes. Send the full visible history so the agent has context.
export async function streamAssistant(
  messages: ChatMessage[],
  threadId: string | null,
  onEvent: (ev: AssistantEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(apiUrl("api/assistant/chat"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, thread_id: threadId }),
    signal,
  });
  if (!res.ok || !res.body) {
    let detail = `/api/assistant/chat failed: ${res.status}`;
    try {
      const j = await res.json();
      if (j?.detail) detail = j.detail;
    } catch {
      /* non-JSON body */
    }
    throw new Error(detail);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const raw of parts) {
      const line = raw.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;
      try {
        onEvent(JSON.parse(payload) as AssistantEvent);
      } catch {
        /* ignore a malformed chunk */
      }
    }
  }
}
