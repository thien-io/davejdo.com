import { requireAdmin } from "@/lib/supabase/requireAdmin";

export default async function AdminHome() {
  const { supabase } = await requireAdmin();
  const [projects, photos, movies, entries] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("photos").select("*", { count: "exact", head: true }),
    supabase.from("movies").select("*", { count: "exact", head: true }),
    supabase.from("guestbook_entries").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Projects", value: projects.count ?? 0 },
    { label: "Photos",   value: photos.count ?? 0 },
    { label: "Movies",   value: movies.count ?? 0 },
    { label: "Entries",  value: entries.count ?? 0 },
  ];

  return (
    <div className="max-w-4xl">
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500 mb-3">
        Overview
      </p>
      <h1 className="font-display text-6xl mb-12">CONTROL</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-neutral-900 rounded-xl p-6">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500 mb-2">
              {s.label}
            </div>
            <div className="font-display text-5xl">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
