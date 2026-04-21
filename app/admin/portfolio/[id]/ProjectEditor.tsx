"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  upsertProjectAction,
  setProjectMediaAction,
} from "../../actions/projects";
import { MediaManager, type AvailableMedia } from "@/components/admin/MediaManager";
import { slugify } from "@/lib/schemas/project";

export function ProjectEditor({
  initial,
  mediaIds,
  availableMedia,
}: {
  initial: any;
  mediaIds: string[];
  availableMedia: AvailableMedia[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [media, setMedia] = useState<string[]>(mediaIds);
  const [available, setAvailable] = useState<AvailableMedia[]>(availableMedia);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const result = await upsertProjectAction(fd);
    if ("error" in result) {
      toast.error(JSON.stringify(result.error));
      setPending(false);
      return;
    }
    if (result.id) {
      await setProjectMediaAction(result.id, media);
    }
    toast.success("Saved");
    setPending(false);
    router.push("/admin/portfolio");
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-8">
      <div>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500 mb-1">
          {initial ? "Edit" : "New"}
        </p>
        <h1 className="font-display text-5xl">
          {initial?.title ?? "UNTITLED PROJECT"}
        </h1>
      </div>

      <input type="hidden" name="id" value={initial?.id ?? ""} />

      <Field label="Title">
        <input
          name="title"
          required
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!initial) setSlug(slugify(e.target.value));
          }}
          className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-2.5 text-sm"
        />
      </Field>

      <Field label="Slug (URL)">
        <input
          name="slug"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-2.5 text-sm font-mono"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Client">
          <input
            name="client"
            defaultValue={initial?.client ?? ""}
            className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-2.5 text-sm"
          />
        </Field>
        <Field label="Year">
          <input
            name="year"
            type="number"
            defaultValue={initial?.year ?? ""}
            className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-2.5 text-sm"
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          name="description"
          rows={3}
          defaultValue={initial?.description ?? ""}
          className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-2.5 text-sm"
        />
      </Field>

      <Field label="Cover">
        <select
          name="cover_media_id"
          defaultValue={initial?.cover_media_id ?? ""}
          className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-2.5 text-sm"
        >
          <option value="">— none —</option>
          {available.map((m) => (
            <option key={m.id} value={m.id}>
              {m.alt ??
                m.storage_path?.split("/").pop() ??
                m.external_url ??
                m.id}
            </option>
          ))}
        </select>
      </Field>

      <MediaManager
        ownerId={initial?.id}
        value={media}
        available={available}
        onChange={setMedia}
        onAvailableChange={setAvailable}
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="published"
          value="true"
          defaultChecked={initial?.published ?? true}
        />
        Published
      </label>
      <input type="hidden" name="position" value={initial?.position ?? 0} />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 bg-[#d4b97c] text-black rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/portfolio")}
          className="px-6 py-2.5 border border-neutral-800 rounded-lg text-sm text-neutral-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500 mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}
