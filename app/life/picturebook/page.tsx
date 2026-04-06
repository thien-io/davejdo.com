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
// Add your Google Drive photos here.
// Format: https://lh3.googleusercontent.com/d/<FILE_ID>
// Or:     https://drive.google.com/uc?export=view&id=<FILE_ID>
//
// size options: "small" (1×1) | "wide" (2×1) | "tall" (1×2) | "large" (2×2)
// ─────────────────────────────────────────────────────
const photos = [
  {
    id: 1,
    src: 'https://drive.google.com/uc?export=view&id=15UWFFtYGjcDmV8HBfZiG2UuJvVUNBY1Z',
    caption: 'Autumn Trees',
    location: 'Reservior',
    size: 'Tall',
  },
  {
    id: 2,
    src: 'https://drive.google.com/uc?export=view&id=13-09G_MqISxMECDMPGkaZu9WUMQkMc7R',
    alt: 'Memory 02',
    caption: 'Coffee',
    location: 'WH Center',
    size: 'tall',
  },
  {
    id: 3,
    src: 'https://drive.google.com/uc?export=view&id=1d8hyCnDKlzz9S_CTYtFkfMaeuji3eQjA',
    alt: 'Memory 03',
    caption: 'Walk in the city',
    location: 'New York',
    size: 'Large',
  },
  {
    id: 4,
    src: 'https://drive.google.com/uc?export=view&id=1pGoZlLTUWI0QgDt7aOLiyKCzpcqZlUY',
    alt: 'Memory 04',
    caption: 'World Trade Center',
    location: 'Lower Manhattan',
    size: 'Large',
  },
  {
    id: 5,
    src: 'https://drive.google.com/uc?export=view&id=1K3B1Mz3QZiEn7vUnRwDF53369T1JB4gw',
    alt: 'Memory 05',
    caption: 'Paper Vine',
    location: 'UConn',
    size: 'Large',
  },
  {
    id: 6,
    src: 'https://drive.google.com/uc?export=view&id=188PBNxCZmXBbySHTz7xRHC3exUqSHXOu',
    alt: 'Memory 06',
    caption: 'Senior with a car',
    location: 'Vermont',
    size: 'Large',
  },
  {
    id: 7,
    src: 'https://drive.google.com/uc?export=view&id=1haVOjw08lV6yrgjEX5wSVM17zC_MlZv0',
    alt: 'Memory 07',
    caption: 'Underexposed',
    location: 'New Haven',
    size: 'large',
  },
  {
    id: 8,
    src: 'https://drive.google.com/uc?export=view&id=1KIy57U2AwLDL9sD2Yd_W-BWAIlULsNlN',
    alt: 'Memory 08',
    caption: 'Crowd',
    location: 'New York City',
    size: 'small',
  },
  {
    id: 9,
    src: 'https://drive.google.com/uc?export=view&id=1GCuQvm2MAY0x3DNDNTjn87_SV738yXv9',
    alt: 'Memory 09',
    caption: 'Hey',
    location: 'Burlington',
    size: 'small',
  },
  {
    id: 10,
    src: 'https://drive.google.com/uc?export=view&id=1bibgiQ2SEDmF4I9H6Ox-V-WQu178MzYw',
    alt: 'Memory 10',
    caption: 'Golden Room',
    location: 'Singer Household',
    size: 'Large',
  },
  {
    id: 11,
    src: 'https://drive.google.com/uc?export=view&id=13pDcoYHPyX9ui0W5UAR_G2uvhvy9Y9km',
    alt: 'Memory 11',
    caption: 'Catan',
    location: 'Singer Household',
    size: 'Large',
  },
  {
    id: 12,
    src: 'https://drive.google.com/uc?export=view&id=1F4VEMpnEoaNQdTnptAmhNVTNzBROVMNu',
    alt: 'Memory 12',
    caption: 'Pigskin',
    location: 'CT Beach',
    size: 'large',
  },
  {
    id: 13,
    src: 'https://drive.google.com/uc?export=view&id=1xiQ7a6qV5zFTgGV_velYGP16yM6HSxKV',
    alt: 'Memory 13',
    caption: 'Dragon Ball Cafe',
    location: 'New York',
    size: 'large',
  },
  {
    id: 14,
    src: 'https://drive.google.com/uc?export=view&id=1pcZYF6wXX-qihFi6oRn56XlLfw54ENBa',
    alt: 'Memory 14',
    caption: 'Pink leaves',
    location: 'Reservior',
    size: 'large',
  },

  {
    id: 15,
    src: 'https://drive.google.com/uc?export=view&id=1f9n9deRbIUQRH_XVL8t5ohfyqsWfBfrX',
    alt: 'Memory 15',
    caption: 'Trip to Ball',
    location: 'Brooklyn Bridge Park',
    size: 'tall',
  },
  {
    id: 16,
    src: 'https://drive.google.com/uc?export=view&id=12O0tYNqMTHuaJ5J8eeal4XGBhszg3erl',
    alt: 'Memory 16',
    caption: 'Pool',
    location: 'UVM',
    size: 'Large',
  },
  {
    id: 17,
    src: 'https://drive.google.com/uc?export=view&id=1UD9TIRuG02UWA3_4W8gKGmjFZQjDPhzx',
    alt: 'Memory 17',
    caption: 'Taking in the moment',
    location: 'Brooklyn Bridge Park',
    size: 'small',
  },
  {
    id: 18,
    src: 'https://drive.google.com/uc?export=view&id=1zPqNzyhnWzF3qY4vmvoXQmaFdMjC0CKa',
    alt: 'Memory 18',
    caption: 'Let’s Play',
    location: 'Brooklyn Bridge Park',
    size: 'small',
  },
  {
    id: 19,
    src: 'https://drive.google.com/uc?export=view&id=1NBgbPnNCipiovSKtkcdzOEnWhnowhB8P',
    alt: 'Memory 19',
    caption: 'Pony',
    location: 'Dulitsky Household',
    size: 'Large',
  },
  {
    id: 20,
    src: 'https://drive.google.com/uc?export=view&id=1YOUgBvG9pzkB-TEDQ_3jlFePNRdCmIri',
    alt: 'Memory 20',
    caption: '4 cameras',
    location: 'New Haven',
    size: 'Large',
  },
  {
    id: 21,
    src: 'https://drive.google.com/uc?export=view&id=1UyHJtScBlvPL3AgEEZTgUw5i1cm-SPgR',
    alt: 'Memory 21',
    caption: 'Jump around and have fun',
    location: 'South Burlington',
    size: 'Large',
  },
];
  // { id: 2, src: "https://drive.google.com/uc?export=view&id=YOUR_FILE_ID", alt: "Photo 02", caption: "", location: "", size: "tall" },
  // { id: 3, src: "https://drive.google.com/uc?export=view&id=YOUR_FILE_ID", alt: "Photo 03", caption: "", location: "", size: "small" },


type Photo = typeof photos[0];

const sizeClasses: Record<string, string> = {
  large: 'col-span-2 row-span-2',
  tall: 'col-span-1 row-span-2',
  wide: 'col-span-2 row-span-1',
  small: 'col-span-1 row-span-1',
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
    <div ref={containerRef} className='min-h-screen'>
      {/* Header */}
      <section className='py-24 px-6 md:px-16 border-b border-border'>
        <div className='max-w-6xl mx-auto'>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-4'
          >
            Life / Photography
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='font-display text-7xl md:text-9xl leading-none mb-6'
          >
            PICTURE
            <br />
            <span className='text-brand-muted'>BOOK</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className='text-muted-foreground max-w-md'
          >
            Moments captured along the way. Life through a lens.
          </motion.p>
        </div>
      </section>

      {/* Bento Grid */}
      <section className='py-12 px-4 md:px-10'>
        <div className='max-w-6xl mx-auto'>
          <div className='grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-3'>
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`photo-cell ${sizeClasses[photo.size] ?? 'col-span-1 row-span-1'} relative group cursor-pointer rounded-xl overflow-hidden bg-accent`}
                onClick={() => setSelected(photo)}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className='object-cover transition-transform duration-500 group-hover:scale-105'
                  sizes='(max-width: 768px) 50vw, 25vw'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                <div className='absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300'>
                  <p className='text-white text-sm font-medium leading-tight'>
                    {photo.caption}
                  </p>
                  <p className='text-white/60 text-xs font-mono'>
                    {photo.location}
                  </p>
                </div>
                <div className='absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                  <ZoomIn size={13} className='text-white' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4'
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className='relative max-w-4xl max-h-[90vh] w-full'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='relative w-full h-[75vh] rounded-2xl overflow-hidden'>
              <Image
                src={selected.src}
                alt={selected.alt}
                fill
                className='object-contain'
                sizes='90vw'
              />
            </div>
            <div className='flex items-start justify-between mt-4 px-1'>
              <div>
                <p className='text-white font-medium'>{selected.caption}</p>
                <p className='text-white/50 text-sm font-mono'>
                  {selected.location}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className='w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors'
              >
                <X size={14} className='text-white' />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer />
    </div>
  );
}
