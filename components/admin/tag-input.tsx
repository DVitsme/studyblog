"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Library §29 — tokenized tag field: #chips + inline mono input, Enter/comma to create, autocomplete.
export function TagInput({
  value,
  onChange,
  suggestions = [],
  max = 20,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  max?: number;
}) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);

  function add(raw: string) {
    const tag = raw.trim().replace(/^#/, "");
    setInput("");
    if (!tag) return;
    if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) return;
    if (value.length >= max) return;
    onChange([...value, tag]);
  }
  function removeAt(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  const matches = input.trim()
    ? suggestions
        .filter(
          (s) =>
            s.toLowerCase().includes(input.trim().toLowerCase()) &&
            !value.some((v) => v.toLowerCase() === s.toLowerCase()),
        )
        .slice(0, 6)
    : [];

  return (
    <div className="relative">
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background p-1.5",
          focused && "ring-2 ring-ring",
        )}
      >
        {value.map((tag, i) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-secondary py-0.5 pl-2 pr-1 font-mono text-xs text-secondary-foreground"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label={`Remove ${tag}`}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(input);
            } else if (e.key === "Backspace" && !input && value.length) {
              removeAt(value.length - 1);
            }
          }}
          placeholder={value.length ? "" : "Add tags…"}
          className="min-w-[90px] flex-1 bg-transparent px-1 py-0.5 font-mono text-xs outline-none placeholder:text-muted-foreground"
        />
      </div>
      {focused && matches.length > 0 ? (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md">
          {matches.map((m) => (
            <li key={m}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(m);
                }}
                className="block w-full px-3 py-1.5 text-left font-mono text-xs hover:bg-accent"
              >
                #{m}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
