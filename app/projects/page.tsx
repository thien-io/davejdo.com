"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ExternalLink, Github, ArrowUpRight } from "lucide-react";
import { Footer } from "@/components/footer";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: "01",
    title: "Project Alpha",
    desc: "A full-stack SaaS application with real-time collaboration features. Built with Next.js, Supabase, and deployed on Vercel.",
    tags: ["Next.js", "TypeScript", "Supabase"],
    href: "https://github.com/davejdo",
    featured: true,
    status: "Live",
  },
  {
    id: "02",
    title: "Design System",
    desc: "Component library built with Radix UI primitives, Tailwind CSS, and comprehensive Storybook documentation.",
    tags: ["React", "Tailwind", "Storybook"],
    href: "https://github.com/davejdo",
    featured: true,
    status: "Open Source",
  },
  {
    id: "03",
    title: "CLI Tool",
    desc: "Developer productivity tool for automating repetitive tasks. Published on npm with 500+ weekly downloads.",
    tags: ["Node.js", "CLI", "npm"],
    href: "https://github.com/davejdo",
    featured: false,
    status: "Published",
  },
  {
    id: "04",
    title: "API Gateway",
    desc: "High-performance REST API with rate limiting, caching, and comprehensive API documentation.",
    tags: ["Node.js", "Redis", "PostgreSQL"],
    href: "https://github.com/davejdo",
    featured: false,
    status: "Live",
  },
  {
    id: "05",
    title: "Mobile App",
    desc: "Cross-platform mobile application built with React Native for iOS and Android.",
    tags: ["React Native", "Expo", "Firebase"],
    href: "https://github.com/davejdo",
    featured: false,
    status: "Beta",
  },
  {
    id: "06",
    title: "Analytics Dashboard",
    desc: "Real-time analytics dashboard with interactive charts, filters, and export functionality.",
    tags: ["React", "D3.js", "GraphQL"],
    href: "https://github.com/davejdo",
    featured: false,
    status: "Live",
  },
];

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

  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

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
            A selection of things I&apos;ve built — side projects, open source work, and client projects.
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
            {featured.map((project) => (
              <motion.a
                key={project.id}
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card group relative p-8 rounded-2xl border border-border bg-card hover:border-foreground/20 transition-all duration-300 overflow-hidden"
                whileHover={{ y: -4 }}
              >
                {/* BG number */}
                <div className="absolute right-6 bottom-4 font-display text-8xl text-foreground/[0.04] select-none pointer-events-none">
                  {project.id}
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground px-2 py-1 rounded-md bg-accent border border-border">
                      {project.status}
                    </span>
                    <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-200" />
                  </div>
                  <h3 className="font-display text-4xl mb-3 group-hover:text-muted-foreground transition-colors">
                    {project.title.toUpperCase()}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {project.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-accent text-muted-foreground font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.a>
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
            {rest.map((project, i) => (
              <motion.a
                key={project.id}
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card group flex items-center gap-6 py-6 border-b border-border hover:bg-accent/30 -mx-4 px-4 rounded-lg transition-all duration-200"
                whileHover={{ x: 4 }}
              >
                <span className="font-mono text-xs text-muted-foreground w-8 flex-shrink-0">
                  {project.id}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-2xl group-hover:text-muted-foreground transition-colors">
                      {project.title.toUpperCase()}
                    </h3>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground hidden md:block">
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {project.desc}
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-4">
                  <div className="hidden md:flex gap-2">
                    {project.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-accent text-muted-foreground font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </motion.a>
            ))}
          </div>

          {/* GitHub link */}
          <div className="mt-12 text-center">
            <a
              href="https://github.com/davejdo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-200"
            >
              <Github size={16} />
              View all on GitHub
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
