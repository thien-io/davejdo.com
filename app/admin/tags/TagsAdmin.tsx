"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  renameTagAction,
  deleteTagAction,
  mergeTagAction,
} from "../actions/tags";

type Tag = { id: string; name: string; slug: string; count: number };

export function TagsAdmin({ initialTags }: { initialTags: Tag[] }) {
  const [tags, setTags] = useState(initialTags);

  async function onRename(id: string, name: string) {
    const res = await renameTagAction(id, name);
    if ("error" in res) toast.error(String(res.error));
    else setTags(tags.map((t) => (t.id === id ? { ...t, name } : t)));
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this tag? Photos keep their other tags.")) return;
    await deleteTagAction(id);
    setTags(tags.filter((t) => t.id !== id));
  }

  async function onMerge(sourceId: string, targetId: string) {
    const source = tags.find((t) => t.id === sourceId)!;
    const target = tags.find((t) => t.id === targetId)!;
    if (!confirm(`Merge "${source.name}" into "${target.name}"?`)) return;
    await mergeTagAction(sourceId, targetId);
    setTags(tags.filter((t) => t.id !== sourceId));
  }

  return (
    <div className="max-w-3xl">
      <header className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
          Manage
        </p>
        <h1 className="font-display text-5xl">TAGS</h1>
      </header>

      <div className="border border-neutral-900 rounded-xl divide-y divide-neutral-900">
        {tags.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-4 py-3">
            <input
              defaultValue={t.name}
              onBlur={(e) =>
                e.target.value !== t.name && onRename(t.id, e.target.value)
              }
              className="flex-1 bg-black border border-neutral-900 rounded px-2 py-1 text-sm"
            />
            <span className="font-mono text-xs text-neutral-500">{t.count}</span>
            <select
              defaultValue=""
              onChange={(e) => e.target.value && onMerge(t.id, e.target.value)}
              className="bg-black border border-neutral-900 rounded px-2 py-1 text-xs font-mono"
            >
              <option value="">merge into…</option>
              {tags
                .filter((x) => x.id !== t.id)
                .map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
            </select>
            <button
              onClick={() => onDelete(t.id)}
              className="text-neutral-500 hover:text-red-400 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
        {tags.length === 0 && (
          <div className="px-4 py-8 text-center text-neutral-600 text-sm">
            No tags yet. Add one by tagging a photo.
          </div>
        )}
      </div>
    </div>
  );
}
