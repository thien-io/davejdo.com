"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, Images, Film, Tag, BookText } from "lucide-react";

const items = [
  { label: "Portfolio", href: "/admin/portfolio", icon: FolderOpen },
  { label: "Photos",    href: "/admin/photos",    icon: Images },
  { label: "Movies",    href: "/admin/movies",    icon: Film },
  { label: "Tags",      href: "/admin/tags",      icon: Tag },
  { label: "Guestbook", href: "/admin/guestbook", icon: BookText },
];

export function AdminRail() {
  const pathname = usePathname();
  return (
    <aside className="w-60 border-r border-neutral-900 min-h-screen p-5">
      <Link href="/admin" className="block mb-10">
        <div className="font-display text-2xl tracking-wider">
          DAVEJ<span className="text-[#d4b97c]">DO</span>
        </div>
        <span className="text-xs font-mono tracking-widest text-neutral-500 block mt-1">
          ADMIN
        </span>
      </Link>
      <nav className="space-y-1">
        {items.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-500 hover:text-white hover:bg-neutral-900/60"
              }`}
            >
              <Icon size={14} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
