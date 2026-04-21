"use client";

import { useState } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { Dropzone, type UploadedMedia } from "./Dropzone";
import { supabasePublicUrl } from "@/lib/supabase/urls";

export type AvailableMedia = {
  id: string;
  storage_path: string | null;
  external_url: string | null;
  kind: string;
  blurhash: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
};

export function MediaManager({
  ownerId,
  value,
  available,
  onChange,
  onAvailableChange,
}: {
  ownerId?: string;
  value: string[];
  available: AvailableMedia[];
  onChange: (ids: string[]) => void;
  onAvailableChange: (next: AvailableMedia[]) => void;
}) {
  const [externalUrl, setExternalUrl] = useState("");

  function onUploaded(uploads: UploadedMedia[]) {
    const newMedia: AvailableMedia[] = uploads.map((u) => ({
      id: u.mediaId,
      storage_path: null,
      external_url: null,
      kind: u.kind,
      blurhash: u.blurhash ?? null,
      alt: null,
      width: u.width ?? null,
      height: u.height ?? null,
    }));
    onAvailableChange([...available, ...newMedia]);
    onChange([...value, ...newMedia.map((m) => m.id)]);
  }

  async function addExternal() {
    if (!externalUrl.trim()) return;
    const { createMediaAction } = await import("@/app/admin/actions/media");
    const result = await createMediaAction({
      kind: "external_video",
      owner_resource: "project",
      owner_id: ownerId,
      external_url: externalUrl.trim(),
      alt: externalUrl.trim(),
    });
    if ("error" in result) {
      alert(result.error);
      return;
    }
    const newMedia: AvailableMedia = {
      id: result.mediaId,
      storage_path: null,
      external_url: externalUrl.trim(),
      kind: "external_video",
      blurhash: null,
      alt: null,
      width: null,
      height: null,
    };
    onAvailableChange([...available, newMedia]);
    onChange([...value, newMedia.id]);
    setExternalUrl("");
  }

  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return;
    const oldIdx = value.indexOf(String(e.active.id));
    const newIdx = value.indexOf(String(e.over.id));
    onChange(arrayMove(value, oldIdx, newIdx));
  }

  function remove(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  return (
    <div className="space-y-4">
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
        Lightbox media (drag to reorder)
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={value} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-2 flex-wrap">
            {value.map((id) => {
              const m = available.find((x) => x.id === id);
              if (!m) return null;
              return <MediaTile key={id} media={m} onRemove={() => remove(id)} />;
            })}
          </div>
        </SortableContext>
      </DndContext>

      <Dropzone
        target="portfolio"
        ownerResource="project"
        ownerId={ownerId}
        onComplete={onUploaded}
      />

      <div className="flex gap-2">
        <input
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          placeholder="Paste YouTube/Vimeo/MP4 URL"
          className="flex-1 bg-black border border-neutral-800 rounded-lg px-4 py-2 text-sm font-mono"
        />
        <button
          type="button"
          onClick={addExternal}
          className="px-4 py-2 border border-neutral-800 rounded-lg text-sm"
        >
          Add link
        </button>
      </div>
    </div>
  );
}

function MediaTile({
  media,
  onRemove,
}: {
  media: AvailableMedia;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: media.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const url = media.storage_path
    ? supabasePublicUrl(media.storage_path)
    : media.external_url ?? "";
  const isVideo = media.kind !== "image";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-24 h-24 border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950"
    >
      <button {...attributes} {...listeners} className="absolute inset-0" />
      {isVideo ? (
        <div className="w-full h-full flex items-center justify-center text-xs font-mono text-neutral-500">
          VIDEO
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={media.alt ?? ""}
          className="w-full h-full object-cover"
        />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center hover:bg-red-500/80"
      >
        <X size={10} />
      </button>
    </div>
  );
}
