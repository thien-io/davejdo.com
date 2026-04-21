"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export type UploadTarget = "photos" | "portfolio";

export type UploadedMedia = {
  mediaId: string;
  publicUrl: string;
  kind: "image" | "video";
  width?: number;
  height?: number;
  blurhash?: string;
};

export function Dropzone({
  target,
  ownerResource,
  ownerId,
  multiple = true,
  onComplete,
}: {
  target: UploadTarget;
  ownerResource: "project" | "photo";
  ownerId?: string;
  multiple?: boolean;
  onComplete: (uploads: UploadedMedia[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});

  async function handleFiles(files: FileList) {
    const list = Array.from(files);
    const results: UploadedMedia[] = [];

    for (const file of list) {
      try {
        const result = await uploadOne(file, target, ownerResource, ownerId, (p) =>
          setProgress((prev) => ({ ...prev, [file.name]: p }))
        );
        results.push(result);
      } catch (err: any) {
        toast.error(`${file.name}: ${err.message ?? "upload failed"}`);
      }
    }

    setProgress({});
    onComplete(results);
  }

  return (
    <div className="border-2 border-dashed border-neutral-800 rounded-xl p-8 text-center">
      <input
        ref={fileRef}
        type="file"
        multiple={multiple}
        accept="image/*,video/mp4,video/quicktime"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex flex-col items-center gap-3 mx-auto text-neutral-400 hover:text-white"
      >
        <Upload size={28} />
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase">
          Click to upload
        </span>
        <span className="text-xs text-neutral-600">
          Images ≤ 10 MB · Videos ≤ 50 MB
        </span>
      </button>

      {Object.entries(progress).length > 0 && (
        <div className="mt-6 space-y-2 text-left">
          {Object.entries(progress).map(([name, p]) => (
            <div key={name} className="text-xs font-mono">
              <div className="flex justify-between mb-1 text-neutral-400">
                <span className="truncate">{name}</span>
                <span>{p}%</span>
              </div>
              <div className="h-1 bg-neutral-900 rounded">
                <div
                  className="h-full bg-[#d4b97c] rounded transition-all"
                  style={{ width: `${p}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

async function uploadOne(
  file: File,
  target: UploadTarget,
  ownerResource: "project" | "photo",
  ownerId: string | undefined,
  onProgress: (p: number) => void
): Promise<UploadedMedia> {
  const { encodeImageToBlurhash } = await import("@/lib/blurhash");
  const { createMediaAction, finalizeMediaAction } = await import(
    "@/app/admin/actions/media"
  );

  const isVideo = file.type.startsWith("video/");
  const sizeLimit = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > sizeLimit) {
    throw new Error(`file too large (> ${sizeLimit / 1024 / 1024} MB)`);
  }

  let width: number | undefined;
  let height: number | undefined;
  let blurhash: string | undefined;

  if (!isVideo) {
    const bitmap = await createImageBitmap(file);
    width = bitmap.width;
    height = bitmap.height;
    blurhash = await encodeImageToBlurhash(file);
  } else {
    const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () =>
        resolve({ w: video.videoWidth, h: video.videoHeight });
      video.onerror = () => reject(new Error("video metadata unreadable"));
      video.src = URL.createObjectURL(file);
    });
    width = dims.w;
    height = dims.h;
  }

  const created = await createMediaAction({
    kind: isVideo ? "video" : "image",
    owner_resource: ownerResource,
    owner_id: ownerId,
    width,
    height,
    blurhash,
    alt: file.name,
    target,
    filename: file.name,
  });

  if ("error" in created) throw new Error(created.error);
  if (!("signedUrl" in created)) throw new Error("no signed URL returned");

  const uploadRes = await fetch(created.signedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!uploadRes.ok) throw new Error(`storage upload failed (${uploadRes.status})`);

  const finalize = await finalizeMediaAction(created.mediaId, created.storagePath);
  if ("error" in finalize) throw new Error(finalize.error);

  onProgress(100);

  return {
    mediaId: created.mediaId,
    publicUrl: created.publicUrl,
    kind: isVideo ? "video" : "image",
    width,
    height,
    blurhash,
  };
}
