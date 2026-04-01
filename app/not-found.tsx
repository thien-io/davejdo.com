"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-display text-[20vw] leading-none text-foreground/[0.05] select-none">
            404
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="-mt-8 relative z-10"
        >
          <h1 className="font-display text-5xl mb-4">PAGE NOT FOUND</h1>
          <p className="text-muted-foreground mb-8">
            This page doesn&apos;t exist, or was moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-200"
          >
            <ArrowLeft size={14} />
            Back home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
