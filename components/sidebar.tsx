"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Home,
  User,
  FolderOpen,
  BookImage,
  Film,
  Music2,
  Sun,
  Moon,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "About", href: "/about", icon: User },
  { label: "Projects", href: "/projects", icon: FolderOpen },
];

const lifeItems = [
  { label: "Picturebook", href: "/life/picturebook", icon: BookImage },
  { label: "Films", href: "/life/films", icon: Film },
  { label: "Music", href: "/life/music", icon: Music2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-8 px-5">
      {/* Logo */}
      <div className="mb-10">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <motion.div
            whileHover={{ x: 2 }}
            className="flex items-baseline gap-1"
          >
            <span className="font-display text-4xl tracking-wider text-foreground">
              DAVE
            </span>
            <span className="font-display text-4xl tracking-wider text-brand-muted">
              JDO
            </span>
          </motion.div>
          <p className="text-xs font-mono text-muted-foreground mt-0.5 tracking-widest uppercase">
            davejdo.com
          </p>
        </Link>
      </div>

      {/* Main Nav */}
      <div className="mb-8">
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-3 px-1">
          Navigate
        </p>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`sidebar-link ${active ? "active" : ""} group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  active
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon
                  size={15}
                  className={active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}
                />
                <span>{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="active-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-foreground"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Life Section */}
      <div className="mb-8">
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-3 px-1">
          Life
        </p>
        <nav className="space-y-0.5">
          {lifeItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`sidebar-link ${active ? "active" : ""} group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  active
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon
                  size={15}
                  className={active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}
                />
                <span>{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="active-life-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-foreground"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Actions */}
      <div className="space-y-2">
        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
        )}

        {/* Social Links */}
        <div className="flex items-center gap-2 px-3 pt-2 border-t border-border">
          {["twitter", "github", "instagram"].map((social) => (
            <a
              key={social}
              href={`https://${social}.com/davejdo`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono tracking-wider text-muted-foreground hover:text-foreground transition-colors uppercase"
            >
              {social.slice(0, 2).toUpperCase()}
            </a>
          ))}
          <div className="flex-1" />
          <ExternalLink size={10} className="text-muted-foreground" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-background border-r border-border flex-col z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-lg bg-background border border-border shadow-lg"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-72 bg-background border-r border-border z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
