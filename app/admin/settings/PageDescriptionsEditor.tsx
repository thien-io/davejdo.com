"use client";

import { useState } from "react";
import { toast } from "sonner";
import { setPageDescriptionAction } from "../actions/settings";

type Row = { slug: string; description: string };

const PAGE_LABELS: Record<string, string> = {
  home:        "Home (hero tagline)",
  work:        "/work",
  picturebook: "/life/picturebook",
  films:       "/life/films",
  music:       "/life/music",
  about:       "/about",
  guestbook:   "/guestbook",
};

// Display order for editor rows.
const ORDER = ["home", "work", "picturebook", "films", "music", "about", "guestbook"];

export function PageDescriptionsEditor({ initial }: { initial: Row[] }) {
  const byslug = Object.fromEntries(initial.map((r) => [r.slug, r.description]));
  const [drafts, setDrafts] = useState<Record<string, string>>(byslug);
  const [saving, setSaving] = useState<string | null>(null);

  async function save(slug: string) {
    setSaving(slug);
    const res = await setPageDescriptionAction(slug, drafts[slug] ?? "");
    setSaving(null);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success(`${PAGE_LABELS[slug]} saved`);
    }
  }

  return (
    <section>
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500 mb-3">
        Page descriptions
      </div>
      <p className="text-sm text-neutral-400 mb-6 max-w-xl">
        The short paragraph that appears under each page title. About supports
        multiple paragraphs — separate them with a blank line.
      </p>

      <div className="space-y-6">
        {ORDER.map((slug) => {
          const dirty = (drafts[slug] ?? "") !== (byslug[slug] ?? "");
          return (
            <div key={slug} className="border border-neutral-900 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
                  {PAGE_LABELS[slug]}
                </label>
                <button
                  onClick={() => save(slug)}
                  disabled={!dirty || saving === slug}
                  className="px-3 py-1 text-xs font-mono uppercase tracking-widest border border-neutral-800 rounded-lg disabled:opacity-40 hover:border-[#d4b97c] hover:text-[#d4b97c]"
                >
                  {saving === slug ? "…" : dirty ? "Save" : "Saved"}
                </button>
              </div>
              <textarea
                value={drafts[slug] ?? ""}
                onChange={(e) =>
                  setDrafts({ ...drafts, [slug]: e.target.value })
                }
                rows={slug === "about" ? 6 : 3}
                maxLength={2000}
                className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm leading-relaxed outline-none focus:border-neutral-500"
              />
              <div className="mt-1 font-mono text-[10px] tracking-widest uppercase text-neutral-600">
                {(drafts[slug] ?? "").length}/2000
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
