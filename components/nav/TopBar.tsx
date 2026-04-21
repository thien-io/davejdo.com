"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Menu, Sun, Moon } from "lucide-react";
import { Drawer } from "./Drawer";

const sectionLabel: Record<string, string> = {
  "/":                 "INDEX",
  "/work":             "WORK",
  "/life/picturebook": "PICTUREBOOK",
  "/life/films":       "FILMS",
  "/life/music":       "MUSIC",
  "/about":            "ABOUT",
  "/guestbook":        "GUESTBOOK",
};

export function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  useEffect(() => setMounted(true), []);

  // Hide on admin routes — admin has its own chrome.
  if (pathname.startsWith("/admin")) return null;

  const label =
    sectionLabel[pathname] ??
    Object.entries(sectionLabel).find(
      ([k]) => k !== "/" && pathname.startsWith(k)
    )?.[1] ??
    "";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-5 md:px-8 h-14">
          <Link href="/" className="flex items-baseline">
            <span className="font-display text-xl md:text-2xl tracking-wider">
              DAVEJ
            </span>
            <span className="font-display text-xl md:text-2xl tracking-wider text-[#d4b97c]">
              DO
            </span>
          </Link>
          <div className="hidden md:block font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
            {label}
          </div>
          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            )}
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md text-[10px] font-mono tracking-[0.22em] uppercase"
              aria-label="Open menu"
            >
              <Menu size={12} /> MENU
            </button>
          </div>
        </div>
      </header>
      <Drawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
