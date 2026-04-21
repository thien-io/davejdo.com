"use client";

import { useState } from "react";
import { toast } from "sonner";
import { supabasePublicUrl } from "@/lib/supabase/urls";
import { Dropzone, type UploadedMedia } from "@/components/admin/Dropzone";
import { setHeroMediaAction } from "../actions/settings";

type Media = {
  id: string;
  kind: string;
  storage_path: string | null;
  external_url: string | null;
  alt: string | null;
};

export function SettingsAdmin({
  initialHeroId,
  initialMedia,
}: {
  initialHeroId: string | null;
  initialMedia: Media[];
}) {
  const [heroId, setHeroId] = useState<string | null>(initialHeroId);
  const [media, setMedia] = useState<Media[]>(initialMedia);
  const [saving, setSaving] = useState(false);

  async function save(nextId: string | null) {
    setSaving(true);
    setHeroId(nextId);
    const res = await setHeroMediaAction(nextId);
    setSaving(false);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success(nextId ? "Hero image saved" : "Hero image cleared");
    }
  }

  function onUploaded(uploads: UploadedMedia[]) {
    if (uploads.length === 0) return;
    const newMedia: Media[] = uploads
      .filter((u) => u.kind === "image")
      .map((u) => ({
        id: u.mediaId,
        kind: u.kind,
        storage_path: null,
        external_url: null,
        alt: null,
      }));
    setMedia([...newMedia, ...media]);
    // Auto-select the first newly uploaded image as hero.
    if (newMedia[0]) save(newMedia[0].id);
  }

  const imageMedia = media.filter((m) => m.kind === "image");

  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
          Manage
        </p>
        <h1 className="font-display text-5xl">SETTINGS</h1>
      </header>

      <section className="mb-12">
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500 mb-3">
          Hero image
        </div>
        <p className="text-sm text-neutral-400 mb-6 max-w-xl">
          Displayed as a full-bleed background behind the homepage hero. Leave empty
          for the default typographic hero.
        </p>

        <div className="mb-6">
          <Dropzone
            target="portfolio"
            ownerResource="project"
            multiple={false}
            onComplete={onUploaded}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => save(null)}
            disabled={saving}
            className={`aspect-[4/3] rounded-xl border-2 border-dashed flex items-center justify-center text-xs font-mono uppercase tracking-widest transition-colors ${
              heroId === null
                ? "border-[#d4b97c] text-[#d4b97c]"
                : "border-neutral-800 text-neutral-600 hover:border-neutral-600"
            }`}
          >
            None
          </button>
          {imageMedia.map((m) => (
            <button
              key={m.id}
              onClick={() => save(m.id)}
              disabled={saving || !m.storage_path}
              className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-colors ${
                heroId === m.id
                  ? "border-[#d4b97c]"
                  : "border-transparent hover:border-neutral-700"
              }`}
            >
              {m.storage_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={supabasePublicUrl(m.storage_path)}
                  alt={m.alt ?? ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-[10px] font-mono text-neutral-600">
                  pending
                </div>
              )}
              {heroId === m.id && (
                <div className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-[#d4b97c] text-black rounded-full">
                  Active
                </div>
              )}
            </button>
          ))}
          {imageMedia.length === 0 && (
            <div className="col-span-full text-center text-neutral-600 text-sm py-6">
              Upload an image above to use as the hero.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
