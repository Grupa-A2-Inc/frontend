import React from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface MarkdownViewerProps {
  content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  if (!content) {
    return (
      <p className="text-brand-muted">
        Nu există conținut pentru această lecție.
      </p>
    );
  }

  const components: Components = {
    code({ children, className }) {
      const match = /language-(\w+)/.exec(className || "");

      return match ? (
        <SyntaxHighlighter
          PreTag="div"
          language={match[1]}
          style={vscDarkPlus as Record<string, React.CSSProperties>}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code
          className={`rounded bg-brand-surface px-1.5 py-0.5 text-brand-primary ${className || ""}`}
        >
          {children}
        </code>
      );
    },
  };

  return (
    <div className="max-w-none text-brand-text leading-7 [&_a]:text-brand-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-brand-primary/40 [&_blockquote]:pl-4 [&_blockquote]:text-brand-muted [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_strong]:text-white [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-brand-border [&_td]:p-2 [&_th]:border [&_th]:border-brand-border [&_th]:bg-brand-surface [&_th]:p-2 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
