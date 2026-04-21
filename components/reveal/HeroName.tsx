"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function HeroName({
  children,
  accentIndex,
  delay = 0.2,
  className = "",
}: {
  children: string;
  accentIndex?: number[];
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el.querySelectorAll("[data-char]"),
        { y: 110, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.04,
          duration: 0.8,
          ease: "power3.out",
          delay,
        }
      );
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(el.querySelectorAll("[data-char]"), { y: 0, opacity: 1 });
    });
    return () => mm.revert();
  }, [delay, children]);

  return (
    <div ref={ref} className={`overflow-hidden leading-none ${className}`}>
      {children.split("").map((ch, i) => (
        <span
          key={i}
          data-char
          className={`inline-block ${
            accentIndex?.includes(i) ? "text-[#d4b97c]" : ""
          }`}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </div>
  );
}
