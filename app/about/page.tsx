"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Footer } from "@/components/footer";

gsap.registerPlugin(ScrollTrigger);

const skills = [
  "Next.js", "TypeScript", "React", "Node.js", "Tailwind CSS",
  "Figma", "Framer", "GSAP", "PostgreSQL", "Vercel",
  "Python", "GraphQL", "Docker", "AWS", "Prisma",
];

const timeline = [
  { year: "2024", title: "Senior Developer", place: "TechCorp", desc: "Leading frontend architecture for enterprise SaaS platform." },
  { year: "2023", title: "Full Stack Engineer", place: "StartupXYZ", desc: "Built and shipped core product features from ground up." },
  { year: "2022", title: "UI Engineer", place: "Agency Co.", desc: "Crafted interfaces for clients across fintech and health." },
  { year: "2020", title: "Started Coding", place: "Self-taught", desc: "Fell in love with building things on the internet." },
];

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".about-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
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
        <div className="max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-4"
          >
            About
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-7xl md:text-9xl leading-none mb-8"
          >
            HEY,
            <br />
            I&apos;M
            <br />
            <span className="text-brand-muted">DAVE.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
          >
            A developer and creator based somewhere with good coffee. I build 
            digital experiences, capture moments through photography, and 
            obsessively catalog films and music.
          </motion.p>
        </div>
      </section>

      {/* Bio */}
      <section className="py-20 px-6 md:px-16">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div className="about-reveal">
            {/* Avatar placeholder */}
            <div className="w-full aspect-square rounded-2xl bg-accent border border-border overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-8xl text-muted-foreground/30">DJ</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-background/80 backdrop-blur-sm border border-border">
                <p className="text-xs font-mono text-muted-foreground">@davejdo</p>
                <p className="text-sm font-medium mt-0.5">davejdo.com</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="about-reveal">
              <h2 className="font-display text-4xl mb-4">THE STORY</h2>
              <p className="text-muted-foreground leading-relaxed">
                Started as a self-taught developer with a designer&apos;s eye. 
                Over the years, I&apos;ve worked across agencies, startups, and 
                enterprises — always gravitating toward the intersection of 
                design and engineering.
              </p>
            </div>

            <div className="about-reveal">
              <p className="text-muted-foreground leading-relaxed">
                When I&apos;m not shipping code, you&apos;ll find me in a cinema, 
                hunting for new music, or with a camera somewhere interesting. 
                This site is my corner of the internet — a mix of work and life.
              </p>
            </div>

            <div className="about-reveal grid grid-cols-3 gap-4 pt-4">
              {[
                { num: "50+", label: "Projects" },
                { num: "4yr", label: "Experience" },
                { num: "∞", label: "Films watched" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-xl border border-border bg-card">
                  <div className="font-display text-3xl mb-1">{stat.num}</div>
                  <div className="text-xs text-muted-foreground font-mono tracking-wider uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-20 px-6 md:px-16 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="about-reveal mb-12">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-3">
              Toolkit
            </p>
            <h2 className="font-display text-5xl">SKILLS & TOOLS</h2>
          </div>
          <div className="about-reveal flex flex-wrap gap-2">
            {skills.map((skill) => (
              <motion.span
                key={skill}
                whileHover={{ scale: 1.05, y: -2 }}
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors cursor-default bg-card"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6 md:px-16 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="about-reveal mb-12">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-3">
              Journey
            </p>
            <h2 className="font-display text-5xl">EXPERIENCE</h2>
          </div>
          <div className="space-y-0">
            {timeline.map((item, i) => (
              <div key={i} className="about-reveal group flex gap-8 py-8 border-b border-border last:border-0">
                <div className="flex-shrink-0 w-16 text-right">
                  <span className="font-mono text-sm text-muted-foreground">{item.year}</span>
                </div>
                <div className="w-px bg-border relative flex-shrink-0">
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-border group-hover:bg-foreground transition-colors" />
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-baseline gap-3 mb-2">
                    <h3 className="font-display text-2xl">{item.title}</h3>
                    <span className="text-sm text-muted-foreground">@ {item.place}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
