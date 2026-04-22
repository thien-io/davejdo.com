import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HeroName } from "@/components/reveal/HeroName";
import { Reveal } from "@/components/reveal/Reveal";
import { ParallaxLayer } from "@/components/reveal/ParallaxLayer";
import { MediaImage } from "@/components/media/MediaImage";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/supabase/queries/settings";
import { getPageDescription } from "@/lib/supabase/queries/pageContent";

const featured = [
  {
    tag: "Portfolio",
    label: "Work",
    href: "/work",
    blurb: "Selected projects — print, social, editorial.",
  },
  {
    tag: "Photography",
    label: "Picturebook",
    href: "/life/picturebook",
    blurb: "Light and moments, tagged by where and when.",
  },
  {
    tag: "Cinema",
    label: "Films",
    href: "/life/films",
    blurb: "A slow diary of movies watched.",
  },
  {
    tag: "Spotify",
    label: "Music",
    href: "/life/music",
    blurb: "What's on repeat, in long-form.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const [settings, description] = await Promise.all([
    getSiteSettings(supabase),
    getPageDescription(supabase, "home"),
  ]);
  const heroImage =
    settings.hero_media?.storage_path || settings.hero_media?.external_url
      ? settings.hero_media
      : null;

  return (
    <>
      <section className="relative min-h-[calc(100vh-3.5rem)] flex items-end px-6 md:px-12 pt-20 pb-16 overflow-hidden">
        {heroImage ? (
          <>
            <ParallaxLayer offset={20} className="absolute inset-0 pointer-events-none">
              <MediaImage
                media={{
                  storage_path: heroImage.storage_path,
                  external_url: heroImage.external_url,
                  blurhash: heroImage.blurhash,
                  alt: heroImage.alt,
                  width: heroImage.width,
                  height: heroImage.height,
                }}
                sizes="100vw"
                priority
                className="w-full h-[115%] object-cover"
              />
            </ParallaxLayer>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-background/70 to-background/40" />
          </>
        ) : (
          <ParallaxLayer
            offset={30}
            className="absolute inset-0 pointer-events-none select-none flex items-end justify-end pr-0"
          >
            <span className="font-display text-[28vw] leading-[0.8] text-foreground/[0.03] whitespace-nowrap translate-y-10">
              DAVEJDO
            </span>
          </ParallaxLayer>
        )}

        <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-[1fr,auto] gap-10 items-end">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background/60 backdrop-blur-sm mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                Available for work
              </span>
            </div>
            <HeroName className="font-display text-[clamp(4rem,10vw,9rem)] tracking-[-0.02em] -mb-3">
              DAVE
            </HeroName>
            <HeroName
              className="font-display text-[clamp(4rem,10vw,9rem)] tracking-[-0.02em]"
              accentIndex={[2, 3]}
              delay={0.5}
            >
              J DO
            </HeroName>
            <Reveal y={20} delay={1.1}>
              <p className="text-muted-foreground max-w-md leading-relaxed text-base md:text-lg mt-6 whitespace-pre-line">
                {description}
              </p>
            </Reveal>
          </div>

          <Reveal
            y={20}
            delay={1.2}
            className="border-l border-border pl-6 pb-4 min-w-[220px] hidden md:block"
          >
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-3">
              Index
            </div>
            <ul className="space-y-1.5 text-sm">
              {featured.map((f) => (
                <li key={f.href}>
                  <Link
                    href={f.href}
                    className="text-foreground/90 hover:text-foreground"
                  >
                    — {f.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-4 border-t border-border font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
              Connecticut · Print · Social
            </div>
          </Reveal>
        </div>

      </section>

      <section className="px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <h2 className="font-display text-[clamp(3rem,7vw,6rem)] leading-[0.9] tracking-tight">
              THE WORLD
              <br />
              OF DAVE
            </h2>
          </div>

          <Reveal
            stagger={0.08}
            className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-border"
          >
            {featured.map((f, i) => (
              <Link
                key={f.href}
                href={f.href}
                className={`group relative flex items-end justify-between px-4 md:px-8 py-8 md:py-14 border-b border-border hover:bg-secondary/30 transition-colors ${
                  i % 2 === 0 ? "md:border-r" : ""
                }`}
              >
                <div>
                  <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-3">
                    {f.tag}
                  </div>
                  <h3 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-none">
                    {f.label.toUpperCase()}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-3 max-w-xs">
                    {f.blurb}
                  </p>
                </div>
                <ArrowUpRight
                  size={20}
                  className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                />
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
