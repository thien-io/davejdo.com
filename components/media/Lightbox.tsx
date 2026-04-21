"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { MediaImage, type MediaImageInput } from "./MediaImage";
import { MediaVideo } from "./MediaVideo";

export type LightboxMedia = MediaImageInput & {
  id: string;
  kind: "image" | "video" | "external_video";
  external_url?: string | null;
};

export function Lightbox({
  items,
  startIndex,
  onClose,
}: {
  items: LightboxMedia[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + items.length) % items.length);
    },
    [items.length]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [go, onClose]);

  const current = items[index];
  if (!current) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-neutral-300 hover:text-white"
          aria-label="Close"
        >
          <X size={22} />
        </button>
        <button
          onClick={() => go(-1)}
          className="absolute left-4 md:left-8 text-neutral-300 hover:text-white p-4"
          aria-label="Previous"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={() => go(1)}
          className="absolute right-4 md:right-8 text-neutral-300 hover:text-white p-4"
          aria-label="Next"
        >
          <ChevronRight size={28} />
        </button>
        <div className="w-[92vw] max-w-[1400px] max-h-[88vh] flex items-center justify-center">
          {current.kind === "image" ? (
            <MediaImage
              media={current}
              className="max-h-[88vh] w-auto h-auto object-contain"
            />
          ) : (
            <MediaVideo
              media={{
                kind: current.kind,
                storage_path: current.storage_path,
                external_url: current.external_url ?? null,
                alt: current.alt ?? null,
              }}
              className="max-h-[88vh] w-full aspect-video"
              controls
            />
          )}
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.22em] uppercase text-neutral-500">
          {index + 1} / {items.length}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
