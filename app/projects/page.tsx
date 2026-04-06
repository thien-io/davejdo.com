"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Construction } from "lucide-react";
import { Footer } from "@/components/footer";

gsap.registerPlugin(ScrollTrigger);

const featuredSlots = [1, 2];
const restSlots = [3, 4, 5, 6];

export default function ProjectsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".project-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.6, ease: "power2.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
            delay: (i % 2) * 0.1,
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
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-4"
          >
            Work
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-7xl md:text-9xl leading-none"
          >
            PROJECTS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mt-6 max-w-xl"
          >
            A section of things I&apos;ve made, side projects, and client projects.
          </motion.p>
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-8">
            Featured
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredSlots.map((n) => (
              <div
                key={n}
                className="project-card relative p-8 rounded-2xl border border-border bg-card overflow-hidden"
              >
                <div className="absolute right-6 bottom-4 font-display text-8xl text-foreground/[0.04] select-none pointer-events-none">
                  {String(n).padStart(2, "0")}
                </div>
                <div className="relative flex flex-col items-center justify-center h-32 gap-3">
                  <Construction size={22} className="text-brand-gold" />
                  <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
                    Under Construction
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All projects list */}
      <section className="py-8 px-6 md:px-16 pb-24">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-8">
            All Projects
          </p>
          <div className="space-y-0">
            {restSlots.map((n, i) => (
              <div
                key={n}
                className="project-card group flex items-center gap-6 py-6 border-b border-border -mx-4 px-4 rounded-lg"
              >
                <span className="font-mono text-xs text-muted-foreground w-8 flex-shrink-0">
                  {String(n).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <Construction size={14} className="text-brand-gold flex-shrink-0" />
                  <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
                    Under Construction
                  </span>
                </div>
                <ArrowUpRight size={14} className="text-muted-foreground/30 flex-shrink-0" />
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-200">
              View All
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
