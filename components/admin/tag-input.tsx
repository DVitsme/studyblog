"use client";

import { useId, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Library §29 — tokenized tag field: #chips + inline mono input, Enter/comma to create.
// Autocomplete follows the WAI-ARIA editable-combobox-with-list pattern (keyboard + AT accessible).
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
  const [active, setActive] = useState(-1); // highlighted suggestion (aria-activedescendant)
  const listId = useId();
  const optionId = (i: number) => `${listId}-opt-${i}`;

  function add(raw: string) {
    const tag = raw.trim().replace(/^#/, "");
    setInput("");
    setActive(-1);
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
  const open = focused && matches.length > 0;

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && matches.length) {
      e.preventDefault();
      setActive((a) => (a + 1) % matches.length);
    } else if (e.key === "ArrowUp" && matches.length) {
      e.preventDefault();
      setActive((a) => (a <= 0 ? matches.length - 1 : a - 1));
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(active >= 0 && matches[active] ? matches[active] : input);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setActive(-1);
      e.currentTarget.blur();
    } else if (e.key === "Backspace" && !input && value.length) {
      removeAt(value.length - 1);
    }
  }

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
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? optionId(active) : undefined}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setActive(-1);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={onKeyDown}
          placeholder={value.length ? "" : "Add tags…"}
          className="min-w-[90px] flex-1 bg-transparent px-1 py-0.5 font-mono text-xs outline-none placeholder:text-muted-foreground"
        />
      </div>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md"
        >
          {matches.map((m, i) => (
            <li
              key={m}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                add(m);
              }}
              className={cn(
                "cursor-pointer px-3 py-1.5 font-mono text-xs",
                i === active ? "bg-accent" : "hover:bg-accent",
              )}
            >
              #{m}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
