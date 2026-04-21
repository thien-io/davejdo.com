"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Reveal({
  children,
  y = 40,
  duration = 0.7,
  stagger = 0,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  y?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const targets = stagger > 0 ? el.children : el;
      gsap.fromTo(
        targets,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          stagger,
          delay,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        }
      );
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(stagger > 0 ? el.children : el, { y: 0, opacity: 1 });
    });
    return () => mm.revert();
  }, [y, duration, stagger, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
