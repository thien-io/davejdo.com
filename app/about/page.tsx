import Image from "next/image";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal/Reveal";

export const metadata = { title: "About · davejdo" };

export default function AboutPage() {
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
                <p>
                  I&rsquo;m Dave J Do — a designer working out of Connecticut, focused
                  on print and social-media design. This site is a running notebook of
                  what I make, what I see, and what I&rsquo;m listening to.
                </p>
                <p className="text-muted-foreground">
                  I care about craft over novelty, typography over graphics, and
                  showing the work more than talking about it.
                </p>
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
