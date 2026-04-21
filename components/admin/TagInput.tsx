"use client";

import { useState } from "react";
import { createTagIfMissingAction } from "@/app/admin/actions/photos";

type Tag = { id: string; name: string; slug: string };

export function TagInput({
  tags,
  value,
  onChange,
  onNewTag,
}: {
  tags: Tag[];
  value: string[];
  onChange: (ids: string[]) => void;
  onNewTag: (tag: Tag) => void;
}) {
  const [input, setInput] = useState("");

  async function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const name = input.trim();
      if (!name) return;
      const existing = tags.find(
        (t) => t.name.toLowerCase() === name.toLowerCase()
      );
      if (existing && !value.includes(existing.id)) {
        onChange([...value, existing.id]);
      } else if (!existing) {
        const result = await createTagIfMissingAction(name);
        if ("error" in result) return;
        onNewTag(result);
        onChange([...value, result.id]);
      }
      setInput("");
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap gap-1 px-3 py-2 border border-neutral-800 rounded-lg bg-black min-h-[40px] items-center">
      {value.map((id) => {
        const t = tags.find((x) => x.id === id);
        if (!t) return null;
        return (
          <span
            key={id}
            className="px-2 py-0.5 text-[11px] font-mono tracking-widest uppercase bg-neutral-900 rounded"
          >
            {t.name}
            <button
              onClick={() => onChange(value.filter((v) => v !== id))}
              className="ml-1"
            >
              ×
            </button>
          </span>
        );
      })}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="tag, tag, …"
        className="flex-1 min-w-[100px] bg-transparent outline-none text-sm"
      />
    </div>
  );
}
