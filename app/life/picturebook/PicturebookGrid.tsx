"use client";

import { useState } from "react";
import Link from "next/link";
import { Lightbox, type LightboxMedia } from "@/components/media/Lightbox";
import { MediaImage } from "@/components/media/MediaImage";

type Tag = { slug: string; name: string; count: number };

export function PicturebookGrid({
  photos,
  tags,
  activeTag,
  page,
}: {
  photos: any[];
  tags: Tag[];
  activeTag: string | null;
  page: number;
}) {
  const [open, setOpen] = useState<{
    items: LightboxMedia[];
    start: number;
  } | null>(null);

  function openAt(i: number) {
    const items: LightboxMedia[] = photos
      .map((p) => p.media)
      .filter(Boolean);
    setOpen({ items, start: i });
  }

  return (
    <section className="px-6 md:px-12 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="sticky top-14 z-30 bg-background/85 backdrop-blur py-3 -mx-6 md:-mx-12 px-6 md:px-12 mb-6 border-b border-border">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <Pill active={!activeTag} href="/life/picturebook">
              All ({tags.reduce((a, t) => a + t.count, 0)})
            </Pill>
            {tags
              .filter((t) => t.count > 0)
              .map((t) => (
                <Pill
                  key={t.slug}
                  active={activeTag === t.slug}
                  href={`/life/picturebook?tag=${t.slug}`}
                >
                  {t.name} ({t.count})
                </Pill>
              ))}
          </div>
        </div>

        <div className="columns-1 sm:columns-2 md:columns-3 gap-4">
          {photos.map((p, i) =>
            p.media ? (
              <button
                key={p.id}
                onClick={() => openAt(i)}
                className="block w-full mb-4 group text-left"
              >
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <MediaImage
                    media={p.media}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                {(p.caption || p.location) && (
                  <div className="flex items-baseline gap-2 mt-2 px-1">
                    {p.caption && (
                      <span className="text-sm text-foreground/90">
                        {p.caption}
                      </span>
                    )}
                    {p.location && (
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                        {p.location}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ) : null
          )}
        </div>

        <div className="flex justify-between items-center mt-10">
          {page > 0 ? (
            <Link
              href={`/life/picturebook?${
                activeTag ? `tag=${activeTag}&` : ""
              }page=${page - 1}`}
              className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground"
            >
              ← Prev
            </Link>
          ) : (
            <span />
          )}
          {photos.length === 30 && (
            <Link
              href={`/life/picturebook?${
                activeTag ? `tag=${activeTag}&` : ""
              }page=${page + 1}`}
              className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground"
            >
              Next →
            </Link>
          )}
        </div>
      </div>

      {open && (
        <Lightbox
          items={open.items}
          startIndex={open.start}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}

function Pill({
  children,
  href,
  active,
}: {
  children: React.ReactNode;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex-none px-3 py-1.5 rounded-full border text-[11px] font-mono uppercase tracking-[0.18em] ${
        active
          ? "bg-foreground text-background border-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
