"use client";

import { useState } from "react";
import { toast } from "sonner";
import { supabasePublicUrl } from "@/lib/supabase/urls";
import { Dropzone, type UploadedMedia } from "@/components/admin/Dropzone";
import { setHeroMediaAction, setProfileMediaAction } from "../actions/settings";

type Media = {
  id: string;
  kind: string;
  storage_path: string | null;
  external_url: string | null;
  alt: string | null;
};

export function SettingsAdmin({
  initialHeroId,
  initialProfileId,
  initialMedia,
}: {
  initialHeroId: string | null;
  initialProfileId: string | null;
  initialMedia: Media[];
}) {
  const [heroId, setHeroId] = useState<string | null>(initialHeroId);
  const [profileId, setProfileId] = useState<string | null>(initialProfileId);
  const [media, setMedia] = useState<Media[]>(initialMedia);
  const [savingHero, setSavingHero] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  async function saveHero(nextId: string | null) {
    setSavingHero(true);
    setHeroId(nextId);
    const res = await setHeroMediaAction(nextId);
    setSavingHero(false);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success(nextId ? "Hero image saved" : "Hero image cleared");
    }
  }

  async function saveProfile(nextId: string | null) {
    setSavingProfile(true);
    setProfileId(nextId);
    const res = await setProfileMediaAction(nextId);
    setSavingProfile(false);
    if ("error" in res) {
      toast.error(res.error);
    } else {
      toast.success(nextId ? "Profile picture saved" : "Profile picture cleared");
    }
  }

  function onHeroUploaded(uploads: UploadedMedia[]) {
    const newMedia = ingest(uploads);
    if (newMedia[0]) saveHero(newMedia[0].id);
  }

  function onProfileUploaded(uploads: UploadedMedia[]) {
    const newMedia = ingest(uploads);
    if (newMedia[0]) saveProfile(newMedia[0].id);
  }

  function ingest(uploads: UploadedMedia[]): Media[] {
    if (uploads.length === 0) return [];
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
    return newMedia;
  }

  const imageMedia = media.filter((m) => m.kind === "image");

  return (
    <div>
      <header className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
          Manage
        </p>
        <h1 className="font-display text-5xl">SETTINGS</h1>
      </header>

      <MediaPicker
        label="Hero image"
        blurb="Displayed as a full-bleed background behind the homepage hero. Leave empty for the default typographic hero."
        currentId={heroId}
        media={imageMedia}
        saving={savingHero}
        onSelect={saveHero}
        onUploaded={onHeroUploaded}
      />

      <div className="h-12" />

      <MediaPicker
        label="About page picture"
        blurb="The round portrait on the About page. Leave empty to fall back to the default."
        currentId={profileId}
        media={imageMedia}
        saving={savingProfile}
        onSelect={saveProfile}
        onUploaded={onProfileUploaded}
        tileShape="circle"
      />
    </div>
  );
}

function MediaPicker({
  label,
  blurb,
  currentId,
  media,
  saving,
  onSelect,
  onUploaded,
  tileShape = "rect",
}: {
  label: string;
  blurb: string;
  currentId: string | null;
  media: Media[];
  saving: boolean;
  onSelect: (id: string | null) => void;
  onUploaded: (uploads: UploadedMedia[]) => void;
  tileShape?: "rect" | "circle";
}) {
  const tileBase =
    tileShape === "circle"
      ? "aspect-square rounded-full"
      : "aspect-[4/3] rounded-xl";

  return (
    <section>
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500 mb-3">
        {label}
      </div>
      <p className="text-sm text-neutral-400 mb-6 max-w-xl">{blurb}</p>

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
          onClick={() => onSelect(null)}
          disabled={saving}
          className={`${tileBase} border-2 border-dashed flex items-center justify-center text-xs font-mono uppercase tracking-widest transition-colors ${
            currentId === null
              ? "border-[#d4b97c] text-[#d4b97c]"
              : "border-neutral-800 text-neutral-600 hover:border-neutral-600"
          }`}
        >
          None
        </button>
        {media.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            disabled={saving || !m.storage_path}
            className={`relative ${tileBase} overflow-hidden border-2 transition-colors ${
              currentId === m.id
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
            {currentId === m.id && (
              <div className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-[#d4b97c] text-black rounded-full">
                Active
              </div>
            )}
          </button>
        ))}
        {media.length === 0 && (
          <div className="col-span-full text-center text-neutral-600 text-sm py-6">
            Upload an image above.
          </div>
        )}
      </div>
    </section>
  );
}
