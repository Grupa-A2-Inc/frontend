import type { ReactNode } from "react";

export function LinkifyText({ text }: { text: string }) {
  const urlPattern = /https?:\/\/[^\s]+/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  urlPattern.lastIndex = 0;

  while ((match = urlPattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));

    const url = match[0];
    nodes.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand-primary underline break-all"
      >
        {url}
      </a>,
    );
    last = match.index + url.length;
  }

  if (last < text.length) nodes.push(text.slice(last));

  return <>{nodes}</>;
}
