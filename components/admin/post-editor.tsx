"use client";

import { useRef } from "react";
import { Bold, Code, Heading, Italic, Link as LinkIcon, List } from "lucide-react";

// Library §27 — MarkdownEditor (Write pane): borderless title + mono toolbar + monospace textarea.
export function MarkdownEditor({
  title,
  onTitleChange,
  body,
  onBodyChange,
}: {
  title: string;
  onTitleChange: (v: string) => void;
  body: string;
  onBodyChange: (v: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Pure helpers — the textarea is passed in (ref.current is read only in the click handler, per
  // react-hooks/refs: refs must not be accessed during render).
  function applyWrap(ta: HTMLTextAreaElement, before: string, after: string) {
    const { selectionStart: s, selectionEnd: e, value } = ta;
    onBodyChange(value.slice(0, s) + before + value.slice(s, e) + after + value.slice(e));
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = s + before.length;
      ta.selectionEnd = e + before.length;
    });
  }
  function applyLinePrefix(ta: HTMLTextAreaElement, prefix: string) {
    const { selectionStart: s, value } = ta;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    onBodyChange(value.slice(0, lineStart) + prefix + value.slice(lineStart));
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = s + prefix.length;
    });
  }

  const tools: { label: string; icon: typeof Bold; run: (ta: HTMLTextAreaElement) => void }[] = [
    { label: "Heading", icon: Heading, run: (ta) => applyLinePrefix(ta, "## ") },
    { label: "Bold", icon: Bold, run: (ta) => applyWrap(ta, "**", "**") },
    { label: "Italic", icon: Italic, run: (ta) => applyWrap(ta, "_", "_") },
    { label: "Link", icon: LinkIcon, run: (ta) => applyWrap(ta, "[", "](url)") },
    { label: "Inline code", icon: Code, run: (ta) => applyWrap(ta, "`", "`") },
    { label: "List", icon: List, run: (ta) => applyLinePrefix(ta, "- ") },
  ];

  return (
    <div className="flex h-full min-w-0 flex-col">
      <input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Post title"
        aria-label="Post title"
        className="w-full bg-transparent px-5 pt-5 text-[22px] font-semibold tracking-tight outline-none placeholder:text-muted-foreground/60"
      />
      <div className="flex items-center gap-0.5 border-b border-border px-4 py-2">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.label}
              type="button"
              onClick={() => {
                const ta = ref.current;
                if (ta) t.run(ta);
              }}
              aria-label={t.label}
              title={t.label}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Icon className="size-4" />
            </button>
          );
        })}
      </div>
      <textarea
        ref={ref}
        value={body}
        onChange={(e) => onBodyChange(e.target.value)}
        placeholder="Write in Markdown…"
        aria-label="Post body (Markdown)"
        spellCheck
        className="min-h-[320px] flex-1 resize-none bg-transparent px-5 py-4 font-mono text-sm leading-[1.7] outline-none placeholder:text-muted-foreground/60"
      />
    </div>
  );
}
