import Image from "next/image";
import { blurhashToDataURL } from "@/lib/blurhash";
import { supabasePublicUrl } from "@/lib/supabase/urls";

export type MediaImageInput = {
  storage_path: string | null;
  external_url?: string | null;
  blurhash: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
};

export function MediaImage({
  media,
  className,
  sizes,
  priority,
}: {
  media: MediaImageInput;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const src = media.storage_path
    ? supabasePublicUrl(media.storage_path)
    : media.external_url ?? "";
  const blur = media.blurhash
    ? blurhashToDataURL(media.blurhash, 32, 32)
    : undefined;

  if (!src) return null;

  return (
    <Image
      src={src}
      alt={media.alt ?? ""}
      width={media.width ?? 1600}
      height={media.height ?? 1200}
      sizes={sizes}
      priority={priority}
      placeholder={blur ? "blur" : "empty"}
      blurDataURL={blur}
      className={className}
    />
  );
}
