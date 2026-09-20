import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "@/components/ai-elements/markdown-components";

// Platform parity: the upstream ai-elements Response wraps Vercel's <Streamdown>.
// The dashboard template renders markdown with react-markdown + remark-gfm
// (already a dependency) plus the shared markdownComponents styling, so tables /
// lists / code render properly without an extra package. Same API:
// <Response>{markdownString}</Response> with an optional className.
type ResponseProps = ComponentProps<"div"> & { children?: string };

export const Response = memo(
    ({ className, children, ...props }: ResponseProps) => (
        <div
            className={cn(
                "size-full min-w-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
                className
            )}
            {...props}
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {typeof children === "string" ? children : ""}
            </ReactMarkdown>
        </div>
    ),
    (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
