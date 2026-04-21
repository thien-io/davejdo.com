"use client";

import { useState } from "react";
import { Lightbox, type LightboxMedia } from "@/components/media/Lightbox";
import { MediaImage } from "@/components/media/MediaImage";

export function WorkGrid({ projects }: { projects: any[] }) {
  const [open, setOpen] = useState<{
    items: LightboxMedia[];
    start: number;
  } | null>(null);
  const [hovering, setHovering] = useState(false);

  function openProject(p: any) {
    const items: LightboxMedia[] = (p.project_media ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((pm: any) => pm.media)
      .filter(Boolean);
    if (items.length === 0 && p.cover) items.push(p.cover);
    if (items.length === 0) return;
    setOpen({ items, start: 0 });
  }

  return (
    <section className="px-6 md:px-12 pb-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => openProject(p)}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className="group text-left"
          >
            <div className="relative aspect-[4/5] bg-secondary rounded-lg overflow-hidden border border-border">
              {p.cover ? (
                <MediaImage
                  media={p.cover}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-muted-foreground">
                  —
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-neutral-300">
                  {p.year ?? ""} {p.client ? `· ${p.client}` : ""}
                </div>
                <div className="font-display text-3xl text-white leading-tight mt-1">
                  {p.title.toUpperCase()}
                </div>
              </div>
            </div>
          </button>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground text-sm">
            Nothing published yet. Check back soon.
          </div>
        )}
      </div>

      {open && (
        <Lightbox
          items={open.items}
          startIndex={open.start}
          onClose={() => setOpen(null)}
        />
      )}

      {hovering && (
        <div className="hidden md:block fixed bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-40 px-3 py-1 rounded-full bg-[#d4b97c] text-black font-mono text-[10px] tracking-[0.22em] uppercase">
          OPEN →
        </div>
      )}
    </section>
  );
}
