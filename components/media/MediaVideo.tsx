"use client";

import { supabasePublicUrl } from "@/lib/supabase/urls";

type Input = {
  kind: "video" | "external_video";
  storage_path: string | null;
  external_url: string | null;
  alt: string | null;
};

export function MediaVideo({
  media,
  className,
  autoPlay = false,
  controls = true,
}: {
  media: Input;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
}) {
  if (media.kind === "video" && media.storage_path) {
    return (
      <video
        className={className}
        src={supabasePublicUrl(media.storage_path)}
        autoPlay={autoPlay}
        controls={controls}
        playsInline
        preload="metadata"
      />
    );
  }

  if (media.kind === "external_video" && media.external_url) {
    const url = media.external_url;

    const yt = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    if (yt) {
      return (
        <iframe
          className={className}
          src={`https://www.youtube.com/embed/${yt[1]}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      );
    }

    const vm = url.match(/vimeo\.com\/(\d+)/);
    if (vm) {
      return (
        <iframe
          className={className}
          src={`https://player.vimeo.com/video/${vm[1]}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }

    return (
      <video
        className={className}
        src={url}
        autoPlay={autoPlay}
        controls={controls}
        playsInline
        preload="metadata"
      />
    );
  }

  return null;
}
