import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getPageDescription } from "@/lib/supabase/queries/pageContent";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal/Reveal";

export const metadata = { title: "About · davejdo" };

export default async function AboutPage() {
  const supabase = await createClient();
  const description = await getPageDescription(supabase, "about");
  const paragraphs = description
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <section className="px-6 md:px-12 pt-24 pb-24">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-4">
              06 — ABOUT
            </div>
            <h1 className="font-display text-[clamp(4rem,10vw,9rem)] leading-[0.85] mb-12">
              ABOUT
            </h1>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-8 items-start">
            <Reveal y={30}>
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border border-border bg-secondary">
                <Image
                  src="/profile.png"
                  alt="Dave J Do"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal y={30} delay={0.1}>
              <div className="space-y-6 text-lg leading-relaxed">
                {paragraphs.map((text, i) => (
                  <p key={i} className={i === 0 ? "" : "text-muted-foreground"}>
                    {text}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal
            y={30}
            className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-20 border-t border-border"
          >
            {[
              { label: "Print", detail: "Editorial layouts, posters, zines." },
              {
                label: "Social Media",
                detail: "Systems for brand feeds and campaigns.",
              },
              {
                label: "Editorial",
                detail: "Long-form identity and type direction.",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="px-4 py-8 border-b md:border-b-0 md:border-r border-border last:border-r-0"
              >
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-2">
                  {s.label}
                </div>
                <p className="text-sm">{s.detail}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
