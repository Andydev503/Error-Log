"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

/** Renders markdown with GitHub-flavoured tables and KaTeX math ($...$, $$...$$). */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
