"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { NowPlayingTicker } from "./NowPlayingTicker";

const items = [
  { label: "Home",        href: "/" },
  { label: "Work",        href: "/work" },
  { label: "Picturebook", href: "/life/picturebook" },
  { label: "Films",       href: "/life/films" },
  { label: "Music",       href: "/life/music" },
  { label: "About",       href: "/about" },
  { label: "Guestbook",   href: "/guestbook" },
];

const socials = [
  { label: "IN", href: "https://instagram.com/davejdo" },
  { label: "X",  href: "https://x.com/davdjdo" },
  { label: "LI", href: "https://linkedin.com/in/davidjdo" },
  { label: "DC", href: "https://discord.com/users/davejdo" },
];

export function Drawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed top-0 left-0 z-50 h-full w-80 bg-background border-r border-border flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-14 border-b border-border">
              <Link href="/" onClick={onClose} className="flex items-baseline">
                <span className="font-display text-xl tracking-wider">DAVEJ</span>
                <span className="font-display text-xl tracking-wider text-[#d4b97c]">
                  DO
                </span>
              </Link>
              <button onClick={onClose} aria-label="Close menu">
                <X size={14} />
              </button>
            </div>
            <nav className="flex-1 px-6 py-8 space-y-1 overflow-y-auto">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="block px-3 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors font-display text-2xl tracking-wide"
                >
                  {item.label.toUpperCase()}
                </Link>
              ))}
              <div className="pt-8 mt-8 border-t border-border">
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-3 px-3">
                  Now Playing
                </div>
                <div className="px-3">
                  <NowPlayingTicker />
                </div>
              </div>
            </nav>
            <div className="px-6 py-6 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                {socials.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] tracking-widest text-muted-foreground hover:text-foreground"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
              <Link
                href="/admin"
                onClick={onClose}
                className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground hover:text-foreground"
              >
                admin
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
