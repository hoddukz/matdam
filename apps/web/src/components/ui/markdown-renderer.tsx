// Tag: core
// Path: apps/web/src/components/ui/markdown-renderer.tsx

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  a: ({ children, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline">
      {children}
    </a>
  ),
  h2: ({ children }) => <h2 className="text-lg font-semibold mt-6 mb-3">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold mt-4 mb-2">{children}</h3>,
  p: ({ children }) => (
    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1 mb-3">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1 mb-3">{children}</ol>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto rounded-lg border my-4">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted text-left">{children}</thead>,
  th: ({ children }) => <th className="px-3 py-2 font-medium">{children}</th>,
  td: ({ children }) => <td className="px-3 py-2 border-t">{children}</td>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-3">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    if (className) {
      return (
        <code className="block bg-muted rounded-md p-3 text-xs overflow-x-auto my-3">
          {children}
        </code>
      );
    }
    return <code className="bg-muted rounded px-1.5 py-0.5 text-xs">{children}</code>;
  },
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`max-w-none ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
