"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight, BookImage, Film, Music2, FolderOpen } from "lucide-react";
import { Footer } from "@/components/footer";

gsap.registerPlugin(ScrollTrigger);

const featured = [
  {
    label: "Picturebook",
    href: "/life/picturebook",
    icon: BookImage,
    desc: "Moments captured in light and shadow.",
    tag: "Photography",
    color: "from-stone-400/20 to-stone-600/10",
  },
  {
    label: "Films",
    href: "/life/films",
    icon: Film,
    desc: "A curated diary of cinema.",
    tag: "Letterboxd style",
    color: "from-zinc-400/20 to-zinc-600/10",
  },
  {
    label: "Music",
    href: "/life/music",
    icon: Music2,
    desc: "Top tracks, albums & now playing.",
    tag: "Spotify",
    color: "from-slate-400/20 to-slate-600/10",
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderOpen,
    desc: "Things I've built and shipped.",
    tag: "Work",
    color: "from-neutral-400/20 to-neutral-600/10",
  },
];

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-char",
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.04,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.2,
        }
      );

      gsap.fromTo(
        ".hero-sub",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.9 }
      );

      gsap.fromTo(
        ".hero-cta",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 1.1 }
      );

      gsap.utils.toArray<HTMLElement>(".reveal-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
            delay: i * 0.1,
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-center overflow-hidden px-6 md:px-16"
      >
        {/* Background texture */}
        <motion.div
          style={{ y, opacity }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-muted/30 to-transparent" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </motion.div>

        {/* Large background text */}
        <div className="absolute bottom-0 right-0 pointer-events-none select-none overflow-hidden">
          <span className="font-display text-[20vw] leading-none text-foreground/[0.03] whitespace-nowrap">
            DAVEJDO
          </span>
        </div>

        <div className="relative z-10 max-w-5xl">
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background/80 backdrop-blur-sm mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-mono tracking-wider text-muted-foreground">
              Available for work
            </span>
          </motion.div>

          {/* Name - split into characters for GSAP */}
          <div className="overflow-hidden mb-2">
            <div className="font-display text-[12vw] md:text-[10vw] leading-none tracking-wide">
              {"DAVE".split("").map((char, i) => (
                <span key={i} className="hero-char inline-block">
                  {char}
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-hidden mb-8">
            <div className="font-display text-[12vw] md:text-[10vw] leading-none tracking-wide text-brand-muted">
              {"JDO".split("").map((char, i) => (
                <span key={i} className="hero-char inline-block">
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* Subtitle */}
          <p className="hero-sub text-muted-foreground text-lg md:text-xl max-w-md leading-relaxed mb-10">
            Designer, developer & creator. Building things that matter and
            capturing life along the way.
          </p>

          {/* CTAs */}
          <div className="hero-cta flex flex-wrap gap-4">
            <Link
              href="/projects"
              className="group flex items-center gap-2 px-5 py-3 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-all duration-200"
            >
              View Projects
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-2 px-5 py-3 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-200"
            >
              About me
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-8 bg-gradient-to-b from-muted-foreground to-transparent"
          />
        </motion.div>
      </section>

      {/* Featured Sections */}
      <section className="py-24 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-3">
              Explore
            </p>
            <h2 className="font-display text-6xl md:text-7xl">
              THE WORLD
              <br />
              OF DAVE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="reveal-card group">
                  <div
                    className={`relative h-52 rounded-2xl border border-border bg-gradient-to-br ${item.color} p-6 flex flex-col justify-between overflow-hidden hover:border-foreground/20 transition-all duration-300`}
                  >
                    {/* BG icon */}
                    <div className="absolute right-6 top-6 opacity-[0.08] group-hover:opacity-[0.12] transition-opacity">
                      <Icon size={80} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center">
                        <Icon size={18} className="text-foreground" />
                      </div>
                      <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground px-2.5 py-1 rounded-full bg-background/60 border border-border">
                        {item.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display text-4xl mb-1 group-hover:translate-x-1 transition-transform duration-200">
                        {item.label.toUpperCase()}
                      </h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>

                    {/* Arrow */}
                    <ArrowRight
                      size={16}
                      className="absolute bottom-6 right-6 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
