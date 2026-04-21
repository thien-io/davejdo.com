"use client";

import { useEffect, useState } from "react";

type NowPlaying = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  albumImageUrl?: string;
};

export function NowPlayingTicker() {
  const [data, setData] = useState<NowPlaying | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch("/api/spotify/now-playing");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ isPlaying: false });
      }
    }
    poll();
    const t = setInterval(poll, 30_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (!data || !data.isPlaying || !data.title) {
    return null;
  }

  return (
    <div className="pt-8 mt-8 border-t border-border">
      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-3 px-3">
        Now Playing
      </div>
      <div className="px-3 flex items-center gap-3">
        {data.albumImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.albumImageUrl}
            alt=""
            className="w-10 h-10 rounded animate-[spin_8s_linear_infinite]"
          />
        )}
        <div className="min-w-0">
          <div className="text-sm truncate">{data.title}</div>
          <div className="text-xs text-muted-foreground truncate">{data.artist}</div>
        </div>
      </div>
    </div>
  );
}
