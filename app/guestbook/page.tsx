import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPageDescription } from "@/lib/supabase/queries/pageContent";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/reveal/Reveal";
import { GuestbookForm } from "./GuestbookForm";

export const metadata = { title: "Guestbook · davejdo" };

const PAGE_SIZE = 50;

export default async function GuestbookPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = Math.max(0, Number(page ?? 0));
  const from = pageNum * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const description = await getPageDescription(supabase, "guestbook");
  const { data, count } = await supabase
    .from("guestbook_entries")
    .select("id, name, message, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  type Entry = { id: string; name: string; message: string; created_at: string };
  const entries = (data ?? []) as Entry[];
  const total = count ?? 0;
  const hasMore = from + entries.length < total;

  return (
    <>
      <section className="px-6 md:px-12 pt-20 pb-10">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <h1 className="font-display text-[clamp(4rem,10vw,9rem)] leading-[0.85]">
              GUESTBOOK
            </h1>
            <p className="text-muted-foreground max-w-md mt-6 whitespace-pre-line">
              {description}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-10">
        <div className="max-w-2xl mx-auto">
          <GuestbookForm />
        </div>
      </section>

      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-2xl mx-auto space-y-3">
          {entries.map((e) => (
            <article
              key={e.id}
              className="border border-border rounded-xl p-5 bg-card"
            >
              <header className="flex items-baseline justify-between mb-2">
                <span className="font-display text-xl tracking-wide text-[#d4b97c]">
                  {e.name}
                </span>
                <time className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                  {formatRelative(e.created_at)}
                </time>
              </header>
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                {e.message}
              </p>
            </article>
          ))}

          {entries.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-12">
              No entries yet. Be the first.
            </div>
          )}

          <div className="flex justify-between items-center pt-6">
            {pageNum > 0 ? (
              <Link
                href={`/guestbook?page=${pageNum - 1}`}
                className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground"
              >
                ← Newer
              </Link>
            ) : (
              <span />
            )}
            {hasMore && (
              <Link
                href={`/guestbook?page=${pageNum + 1}`}
                className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground"
              >
                Older →
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
