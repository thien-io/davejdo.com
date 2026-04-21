import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { PortfolioTable } from "./PortfolioTable";

export default async function PortfolioAdminPage() {
  const { supabase } = await requireAdmin();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, year, client, published, position")
    .order("position", { ascending: false });

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
            Manage
          </p>
          <h1 className="font-display text-5xl">PORTFOLIO</h1>
        </div>
        <Link
          href="/admin/portfolio/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#d4b97c] text-black rounded-lg text-sm font-medium"
        >
          <Plus size={14} /> New project
        </Link>
      </header>

      <PortfolioTable projects={projects ?? []} />
    </div>
  );
}
