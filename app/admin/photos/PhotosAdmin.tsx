"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dropzone, type UploadedMedia } from "@/components/admin/Dropzone";
import { TagInput } from "@/components/admin/TagInput";
import { supabasePublicUrl } from "@/lib/supabase/urls";
import {
  createPhotoAction,
  updatePhotoAction,
  deletePhotoAction,
} from "../actions/photos";

type Tag = { id: string; name: string; slug: string };

export function PhotosAdmin({
  initialPhotos,
  tags: tagsInit,
}: {
  initialPhotos: any[];
  tags: Tag[];
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [tags, setTags] = useState(tagsInit);
  const [batchTagIds, setBatchTagIds] = useState<string[]>([]);

  async function onUploaded(uploads: UploadedMedia[]) {
    const created: any[] = [];
    for (const u of uploads) {
      const result = await createPhotoAction({
        media_id: u.mediaId,
        tag_ids: batchTagIds.length > 0 ? batchTagIds : undefined,
      });
      if ("error" in result) {
        toast.error(JSON.stringify(result.error));
        continue;
      }
      created.push({
        id: result.id,
        media: {
          id: u.mediaId,
          storage_path: null,
          blurhash: u.blurhash,
          kind: u.kind,
        },
        caption: null,
        location: null,
        taken_at: null,
        photo_tags: batchTagIds.map((id) => ({
          tag: tags.find((t) => t.id === id)!,
        })),
      });
    }
    setPhotos([...created, ...photos]);
    toast.success(`${created.length} photo(s) added`);
  }

  async function onPatch(id: string, patch: any) {
    const res = await updatePhotoAction({ id, ...patch });
    if ("error" in res) toast.error(JSON.stringify(res.error));
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this photo?")) return;
    setPhotos(photos.filter((p) => p.id !== id));
    const res = await deletePhotoAction(id);
    if ("error" in res) toast.error(String(res.error));
  }

  return (
    <div>
      <header className="mb-8">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
          Manage
        </p>
        <h1 className="font-display text-5xl">PHOTOS</h1>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr,280px] mb-10">
        <Dropzone
          target="photos"
          ownerResource="photo"
          onComplete={onUploaded}
        />
        <div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500 mb-2">
            Apply to batch uploads
          </div>
          <TagInput
            tags={tags}
            value={batchTagIds}
            onChange={setBatchTagIds}
            onNewTag={(t) => setTags([...tags, t])}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((p) => (
          <div
            key={p.id}
            className="border border-neutral-800 rounded-xl overflow-hidden"
          >
            <div className="aspect-[4/3] bg-neutral-950">
              {p.media?.storage_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={supabasePublicUrl(p.media.storage_path)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            <div className="p-3 space-y-2">
              <input
                defaultValue={p.caption ?? ""}
                placeholder="caption"
                className="w-full bg-black border border-neutral-900 rounded px-2 py-1 text-xs"
                onBlur={(e) =>
                  onPatch(p.id, { caption: e.target.value || null })
                }
              />
              <input
                defaultValue={p.location ?? ""}
                placeholder="location"
                className="w-full bg-black border border-neutral-900 rounded px-2 py-1 text-xs"
                onBlur={(e) =>
                  onPatch(p.id, { location: e.target.value || null })
                }
              />
              <input
                type="date"
                defaultValue={p.taken_at ?? ""}
                className="w-full bg-black border border-neutral-900 rounded px-2 py-1 text-xs"
                onBlur={(e) =>
                  onPatch(p.id, { taken_at: e.target.value || null })
                }
              />
              <TagInput
                tags={tags}
                value={(p.photo_tags ?? []).map((pt: any) => pt.tag.id)}
                onChange={(ids) => onPatch(p.id, { tag_ids: ids })}
                onNewTag={(t) => setTags([...tags, t])}
              />
              <button
                onClick={() => onDelete(p.id)}
                className="w-full text-[11px] font-mono tracking-widest uppercase text-neutral-500 hover:text-red-400 pt-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
