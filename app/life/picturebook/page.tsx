"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";
import { Footer } from "@/components/footer";

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────────────
// REPLACE these with your actual Google Drive direct-link
// images. Format: https://lh3.googleusercontent.com/d/<FILE_ID>
// Or use: https://drive.google.com/uc?export=view&id=<FILE_ID>
// ─────────────────────────────────────────────────────
const photos = [
  { id: 1, src: "https://picsum.photos/seed/photo1/800/600", alt: "Memory 01", caption: "Golden hour", location: "Somewhere nice", size: "large" },
  { id: 2, src: "https://picsum.photos/seed/photo2/600/800", alt: "Memory 02", caption: "City lights", location: "Downtown", size: "tall" },
  { id: 3, src: "https://picsum.photos/seed/photo3/600/600", alt: "Memory 03", caption: "Still life", location: "Home", size: "small" },
  { id: 4, src: "https://picsum.photos/seed/photo4/600/600", alt: "Memory 04", caption: "Morning fog", location: "Riverside", size: "small" },
  { id: 5, src: "https://picsum.photos/seed/photo5/800/600", alt: "Memory 05", caption: "Open roads", location: "Highway", size: "wide" },
  { id: 6, src: "https://picsum.photos/seed/photo6/600/800", alt: "Memory 06", caption: "Shadows", location: "Alley", size: "tall" },
  { id: 7, src: "https://picsum.photos/seed/photo7/800/800", alt: "Memory 07", caption: "Reflection", location: "Lake", size: "large" },
  { id: 8, src: "https://picsum.photos/seed/photo8/600/400", alt: "Memory 08", caption: "Quiet moments", location: "Cafe", size: "small" },
  { id: 9, src: "https://picsum.photos/seed/photo9/600/600", alt: "Memory 09", caption: "Architecture", location: "City", size: "small" },
  { id: 10, src: "https://picsum.photos/seed/photo10/800/600", alt: "Memory 10", caption: "Sunset", location: "Rooftop", size: "wide" },
  { id: 11, src: "https://picsum.photos/seed/photo11/600/800", alt: "Memory 11", caption: "Backstreets", location: "Old town", size: "tall" },
  { id: 12, src: "https://picsum.photos/seed/photo12/600/600", alt: "Memory 12", caption: "Greenery", location: "Park", size: "small" },
  { id: 13, src: "https://picsum.photos/seed/photo13/800/600", alt: "Memory 13", caption: "Night life", location: "Bar", size: "large" },
  { id: 14, src: "https://picsum.photos/seed/photo14/600/600", alt: "Memory 14", caption: "Details", location: "Market", size: "small" },
  { id: 15, src: "https://picsum.photos/seed/photo15/800/600", alt: "Memory 15", caption: "Horizon", location: "Beach", size: "wide" },
];

type Photo = typeof photos[0];

// Bento layout classes per size
const sizeClasses: Record<string, string> = {
  large: "col-span-2 row-span-2",
  tall: "col-span-1 row-span-2",
  wide: "col-span-2 row-span-1",
  small: "col-span-1 row-span-1",
};

export default function PicturebookPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Photo | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".photo-cell").forEach((el, i) => {
        gsap.fromTo(
          el,
          { scale: 0.92, opacity: 0 },
          {
            scale: 1, opacity: 1, duration: 0.6, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%" },
            delay: (i % 4) * 0.08,
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* Header */}
      <section className="py-24 px-6 md:px-16 border-b border-border">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-4"
          >
            Life / Photography
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-7xl md:text-9xl leading-none mb-6"
          >
            PICTURE
            <br />
            <span className="text-brand-muted">BOOK</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-muted-foreground max-w-md"
          >
            Moments captured along the way. Life through a lens.
          </motion.p>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="py-12 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`photo-cell ${sizeClasses[photo.size] || "col-span-1 row-span-1"} relative group cursor-pointer rounded-xl overflow-hidden bg-accent`}
                onClick={() => setSelected(photo)}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white text-sm font-medium leading-tight">{photo.caption}</p>
                  <p className="text-white/60 text-xs font-mono">{photo.location}</p>
                </div>
                {/* Zoom icon */}
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ZoomIn size={13} className="text-white" />
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs font-mono text-muted-foreground mt-8 tracking-wider">
            Replace placeholders with your Google Drive images
          </p>
        </div>
      </section>

      {/* Lightbox */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[75vh] rounded-2xl overflow-hidden">
              <Image
                src={selected.src}
                alt={selected.alt}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>
            <div className="flex items-start justify-between mt-4 px-1">
              <div>
                <p className="text-white font-medium">{selected.caption}</p>
                <p className="text-white/50 text-sm font-mono">{selected.location}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer />
    </div>
  );
}
