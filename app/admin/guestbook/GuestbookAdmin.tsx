"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  deleteGuestbookEntryAction,
  bulkDeleteGuestbookAction,
} from "../actions/guestbook";

type Entry = {
  id: string;
  name: string;
  message: string;
  ip_hash: string | null;
  created_at: string;
};

export function GuestbookAdmin({ initialEntries }: { initialEntries: Entry[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [query, setQuery] = useState("");
  const [last24, setLast24] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q);
      const matchRecent =
        !last24 || Date.now() - new Date(e.created_at).getTime() < 24 * 3600e3;
      return matchQuery && matchRecent;
    });
  }, [entries, query, last24]);

  async function onDelete(id: string) {
    const prev = entries;
    setEntries(entries.filter((e) => e.id !== id));
    const res = await deleteGuestbookEntryAction(id);
    if ("error" in res) {
      setEntries(prev);
      toast.error(String(res.error));
    }
  }

  async function onBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} entries?`)) return;
    const ids = Array.from(selected);
    setEntries(entries.filter((e) => !selected.has(e.id)));
    setSelected(new Set());
    await bulkDeleteGuestbookAction(ids);
  }

  return (
    <div className="max-w-4xl">
      <header className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
          Moderate
        </p>
        <h1 className="font-display text-5xl">GUESTBOOK</h1>
      </header>

      <div className="flex items-center gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or message…"
          className="flex-1 bg-black border border-neutral-800 rounded-lg px-4 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <input
            type="checkbox"
            checked={last24}
            onChange={(e) => setLast24(e.target.checked)}
          />
          Last 24h
        </label>
        <button
          onClick={onBulkDelete}
          disabled={selected.size === 0}
          className="px-3 py-2 text-xs font-mono uppercase tracking-widest border border-neutral-800 rounded-lg disabled:opacity-40"
        >
          Delete selected ({selected.size})
        </button>
      </div>

      <div className="border border-neutral-900 rounded-xl divide-y divide-neutral-900">
        {filtered.map((e) => (
          <label
            key={e.id}
            className="flex items-start gap-3 px-4 py-3 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.has(e.id)}
              onChange={(ev) => {
                const next = new Set(selected);
                if (ev.target.checked) next.add(e.id);
                else next.delete(e.id);
                setSelected(next);
              }}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="text-sm">
                <span className="text-[#d4b97c]">{e.name}</span>
                <span className="mx-2 text-neutral-700">·</span>
                <span className="font-mono text-xs text-neutral-500">
                  {new Date(e.created_at).toLocaleString()}
                </span>
                <span className="mx-2 text-neutral-700">·</span>
                <span className="font-mono text-[10px] text-neutral-600">
                  {e.ip_hash?.slice(0, 8) ?? "—"}
                </span>
              </div>
              <div className="text-sm mt-1 text-neutral-200">{e.message}</div>
            </div>
            <button
              onClick={(ev) => {
                ev.preventDefault();
                onDelete(e.id);
              }}
              className="text-neutral-500 hover:text-red-400 text-sm"
            >
              Delete
            </button>
          </label>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-neutral-600 text-sm">
            No entries.
          </div>
        )}
      </div>
    </div>
  );
}
